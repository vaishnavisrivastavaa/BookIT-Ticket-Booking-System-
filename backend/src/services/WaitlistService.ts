import prisma from '../utils/prisma';

export class WaitlistService {
  static async joinWaitlist(data: any, userId: string) {
    const { eventId, category, numberOfSeats } = data;

    const event = await prisma.events.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Event not found');

    const existingEntry = await prisma.waitlist.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
        status: { in: ['WAITING', 'OFFERED'] }
      }
    });

    if (existingEntry) {
      throw new Error('You are already on the waitlist for this event');
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        event_id: eventId,
        user_id: userId,
        seat_category: category,
        position_in_queue: 1, // simplified
        status: 'WAITING'
      }
    });

    return waitlistEntry;
  }
}
