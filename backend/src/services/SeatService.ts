import prisma from '../utils/prisma';
import { getIO } from '../socket';

export class SeatService {
  static async holdSeats(data: any, userId: string) {
    const { eventId, seatIds } = data;

    // Check if seats are available
    const seats = await prisma.show_seats.findMany({
      where: {
        id: { in: seatIds },
        event_id: eventId,
      }
    });

    if (seats.length !== seatIds.length) {
      throw new Error('Some seats do not exist');
    }

    for (const seat of seats) {
      if (seat.status !== 'AVAILABLE') {
        throw new Error('One or more seats are not available');
      }
    }

    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update seats with Optimistic Concurrency Protection
    const { MongoClient, ObjectId } = require('mongodb');
    const client = new MongoClient(process.env.DATABASE_URL as string);
    await client.connect();
    const db = client.db();
    
    const result = await db.collection('show_seats').updateMany(
      { 
        _id: { $in: seatIds.map((id: string) => new ObjectId(id)) },
        status: 'AVAILABLE'
      },
      { $set: { 
          status: 'HELD',
          held_by_user_id: userId,
          hold_expires_at: holdExpiresAt,
          updated_at: new Date()
        } 
      }
    );
    await client.close();

    if (result.modifiedCount !== seatIds.length) {
      throw new Error('One or more seats were locked by another user simultaneously. Please try again.');
    }

    // Notify clients about seat status changes
    const updatedSeats = await prisma.show_seats.findMany({
      where: { id: { in: seatIds } }
    });
    updatedSeats.forEach(seat => {
      getIO().to(`event_${eventId}`).emit('seat_update', {
        seatId: seat.id,
        status: 'HELD'
      });
    });

    return { holdExpiresAt };
  }
}
