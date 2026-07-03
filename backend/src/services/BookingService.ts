import prisma from '../utils/prisma';
import { sendEmail } from '../utils/emailService';
import { generateQRCode } from '../utils/qrCodeService';
import { getIO } from '../socket';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient, ObjectId } from 'mongodb';

export class BookingService {
  static async createBooking(data: any, userId: string) {
    const { eventId, seatIds } = data;

    // Validate seats
    const seats = await prisma.show_seats.findMany({
      where: {
        id: { in: seatIds },
        event_id: eventId
      },
      include: {
        venue_seats: true,
        events: {
          include: {
            event_prices: true
          }
        }
      }
    });

    if (seats.length !== seatIds.length) {
      throw new Error('Some seats were not found');
    }

    let totalAmount = 0;
    
    // Check if user has holds on these seats
    for (const seat of seats) {
      if (seat.status !== 'HELD' || seat.held_by_user_id !== userId) {
        throw new Error('You must hold all selected seats before booking');
      }

      // Calculate price
      const priceRecord = seat.events.event_prices.find(p => p.category === seat.venue_seats.category);
      if (!priceRecord) {
        throw new Error(`Price not found for category ${seat.venue_seats.category}`);
      }
      totalAmount += priceRecord.price;
    }

    const bookingReference = uuidv4().substring(0, 10).toUpperCase();

    // Bypass Prisma transaction error
    const client = new MongoClient(process.env.DATABASE_URL as string);
    await client.connect();
    const db = client.db();

    const bookingId = new ObjectId();
    
    // Create booking
    await db.collection('bookings').insertOne({
      _id: bookingId,
      customer_id: new ObjectId(userId),
      event_id: new ObjectId(eventId),
      booking_reference: bookingReference,
      booking_time: new Date(),
      total_amount: totalAmount,
      status: 'CONFIRMED',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Update seats natively to bypass Prisma transaction error
    await db.collection('show_seats').updateMany(
      { _id: { $in: seatIds.map((id: string) => new ObjectId(id)) } },
      { $set: { status: 'BOOKED', updated_at: new Date() } }
    );

    // Create booking_seats
    for (const seat of seats) {
      const priceRecord = seat.events.event_prices.find(p => p.category === seat.venue_seats.category);
      await db.collection('booking_seats').insertOne({
        _id: new ObjectId(),
        booking_id: bookingId,
        show_seat_id: new ObjectId(seat.id),
        price: priceRecord ? priceRecord.price : 0,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await client.close();

    const result = {
      id: bookingId.toString(),
      booking_reference: bookingReference,
      total_amount: totalAmount,
      status: 'CONFIRMED'
    };

    // Notify clients about booked seats
    seatIds.forEach((id: string) => {
      getIO().to(`event_${eventId}`).emit('seat_update', {
        seatId: id,
        status: 'BOOKED'
      });
    });

    // Send confirmation email
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (user) {
      const qrCode = await generateQRCode(result.booking_reference);
      const eventInfo = seats[0].events;
      const htmlEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #eaeaea;">
          <div style="background: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">BookIT</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Your Booking is Confirmed!</h2>
            <p style="color: #4b5563; line-height: 1.6;">Hi ${user.first_name || 'there'},</p>
            <p style="color: #4b5563; line-height: 1.6;">Thank you for booking with us. Your tickets for <strong>${eventInfo.title}</strong> are ready.</p>
            
            <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #111827; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Event Details</h3>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Date:</strong> ${new Date(eventInfo.event_date).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Time:</strong> ${eventInfo.event_time}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Order Total:</strong> $${totalAmount.toFixed(2)}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong>Reference:</strong> ${result.booking_reference}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Please present this QR code at the venue</p>
              <img src="cid:qrcode" alt="QR Code Ticket" style="border: 4px solid #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 200px;" />
            </div>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} BookIT. All rights reserved.</p>
          </div>
        </div>
      `;
      await sendEmail(
        user.email,
        `Booking Confirmation: ${result.booking_reference}`,
        htmlEmail,
        [{
          filename: 'qrcode.png',
          content: qrCode,
          cid: 'qrcode'
        }]
      );
    }

    return {
      bookingId: result.id,
      bookingNumber: result.booking_reference,
      totalAmount: result.total_amount,
      status: result.status
    };
  }

  static async getUserBookings(userId: string) {
    const bookings = await prisma.bookings.findMany({
      where: { customer_id: userId },
      include: {
        events: { include: { venues: true } },
        booking_seats: { include: { show_seats: { include: { venue_seats: true } } } }
      },
      orderBy: { booking_time: 'desc' }
    });

    return bookings.map(b => ({
      id: b.id,
      bookingNumber: b.booking_reference,
      eventTitle: b.events.title,
      venueName: b.events.venues.name,
      eventDate: b.events.event_date,
      eventTime: b.events.event_time,
      totalAmount: b.total_amount,
      status: b.status,
      seats: b.booking_seats.map(bs => ({
        category: bs.show_seats.venue_seats.category,
        seatLabel: bs.show_seats.venue_seats.seat_label
      }))
    }));
  }

  static async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.bookings.findFirst({
      where: { id: bookingId, customer_id: userId },
      include: { booking_seats: true }
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.status === 'CANCELLED') throw new Error('Already cancelled');

    const seatIds = booking.booking_seats.map(bs => bs.show_seat_id);

    const client = new MongoClient(process.env.DATABASE_URL as string);
    await client.connect();
    const db = client.db();
    
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { status: 'CANCELLED', updated_at: new Date() } }
    );

    await db.collection('show_seats').updateMany(
      { _id: { $in: seatIds.map((id: string) => new ObjectId(id)) } },
      { $set: { status: 'AVAILABLE', held_by_user_id: null, hold_expires_at: null, updated_at: new Date() } }
    );
    await client.close();
    
    // Notify clients about cancelled seats
    seatIds.forEach((id: string) => {
      getIO().to(`event_${booking.event_id}`).emit('seat_update', {
        seatId: id,
        status: 'AVAILABLE'
      });
    });

    return { success: true, message: 'Booking cancelled' };
  }
}
