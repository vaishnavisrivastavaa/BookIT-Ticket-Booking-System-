import cron from 'node-cron';
import prisma from '../utils/prisma';
import { getIO } from '../socket';
import { sendEmail } from '../utils/emailService';
import { v4 as uuidv4 } from 'uuid';

export const startJobs = () => {
  // Every minute: Release expired seat holds
  cron.schedule('* * * * *', async () => {
    try {
      const expiredSeats = await prisma.show_seats.findMany({
        where: {
          status: 'HELD',
          hold_expires_at: { lt: new Date() }
        }
      });

      if (expiredSeats.length > 0) {
        const seatIds = expiredSeats.map(s => s.id);
        const { MongoClient, ObjectId } = require('mongodb');
        const client = new MongoClient(process.env.DATABASE_URL as string);
        await client.connect();
        const db = client.db();
        await db.collection('show_seats').updateMany(
          { _id: { $in: seatIds.map((id: string) => new ObjectId(id)) } },
          { $set: { status: 'AVAILABLE', held_by_user_id: null, hold_expires_at: null, updated_at: new Date() } }
        );
        await client.close();

        console.log(`Released ${expiredSeats.length} expired seat holds.`);

        // Notify clients
        expiredSeats.forEach(seat => {
          getIO().to(`event_${seat.event_id}`).emit('seat_update', {
            seatId: seat.id,
            status: 'AVAILABLE'
          });
        });
      }
    } catch (e) {
      console.error('Error releasing seats:', e);
    }
  });

  // Every 5 minutes: Process Waitlist
  cron.schedule('*/5 * * * *', async () => {
    try {
      const activeWaitlists = await prisma.waitlist.findMany({
        where: { status: 'WAITING' },
        orderBy: { created_at: 'asc' }
      });

      for (const waitlist of activeWaitlists) {
        // Find available seats for this category
        const availableSeats = await prisma.show_seats.findMany({
          where: {
            event_id: waitlist.event_id,
            venue_seats: {
              category: waitlist.seat_category
            },
            status: 'AVAILABLE'
          },
          take: 1 // Only 1 seat per waitlist since waitlist schema has no numberOfSeats
        });

        if (availableSeats.length === 1) {
          // Offer the seats
          const offerExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          const token = uuidv4();

          await prisma.$transaction(async (tx) => {
            const offer = await tx.waitlist_offers.create({
              data: {
                waitlist_id: waitlist.id,
                token: token,
                expiry_time: offerExpiresAt,
                status: 'ACTIVE'
              }
            });

            await tx.waitlist_offer_seats.create({
              data: {
                offer_id: offer.id,
                show_seat_id: availableSeats[0].id
              }
            });

            await tx.waitlist.update({
              where: { id: waitlist.id },
              data: {
                status: 'OFFERED'
              }
            });

            await tx.show_seats.updateMany({
              where: { id: { in: availableSeats.map(s => s.id) } },
              data: {
                status: 'HELD',
                held_by_user_id: waitlist.user_id,
                hold_expires_at: offerExpiresAt
              }
            });
          });

          const user = await prisma.users.findUnique({ where: { id: waitlist.user_id } });
          const event = await prisma.events.findUnique({ where: { id: waitlist.event_id } });

          if (user && event) {
            await sendEmail(
              user.email,
              `Tickets available for ${event.title}!`,
              `<p>Good news! A ticket has become available for ${event.title}.</p>
               <p>We have held 1 seat for you. You have 24 hours to complete your booking.</p>`
            );
          }
        }
      }
    } catch (e) {
      console.error('Error processing waitlist:', e);
    }
  });

  // Every minute: Check for expired waitlist offers
  cron.schedule('* * * * *', async () => {
    try {
      const expiredOffers = await prisma.waitlist_offers.findMany({
        where: {
          status: 'ACTIVE',
          expiry_time: { lt: new Date() }
        },
        include: {
          waitlist_offer_seats: true,
          waitlist: true
        }
      });

      for (const offer of expiredOffers) {
        await prisma.$transaction(async (tx) => {
          await tx.waitlist_offers.update({
            where: { id: offer.id },
            data: { status: 'EXPIRED' }
          });
          
          await tx.waitlist.update({
            where: { id: offer.waitlist_id },
            data: { status: 'EXPIRED' }
          });

          // Release the seats held for this offer
          const seatIds = offer.waitlist_offer_seats.map(os => os.show_seat_id);
          
          await tx.show_seats.updateMany({
            where: {
              id: { in: seatIds }
            },
            data: {
              status: 'AVAILABLE',
              held_by_user_id: null,
              hold_expires_at: null
            }
          });
        });
        
        // Notify clients about released seats
        const seatIds = offer.waitlist_offer_seats.map(os => os.show_seat_id);
        const releasedSeats = await prisma.show_seats.findMany({
          where: { id: { in: seatIds } }
        });
        
        releasedSeats.forEach(seat => {
          getIO().to(`event_${seat.event_id}`).emit('seat_update', {
            seatId: seat.id,
            status: 'AVAILABLE'
          });
        });
      }
    } catch (e) {
      console.error('Error expiring waitlist offers:', e);
    }
  });
};
