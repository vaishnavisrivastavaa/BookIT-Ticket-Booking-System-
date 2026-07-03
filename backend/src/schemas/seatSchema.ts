import { z } from 'zod';

export const holdSeatsSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  seatIds: z.array(z.string()).min(1, 'At least one seat ID is required').max(10, 'Cannot hold more than 10 seats'),
});

export const createBookingSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  seatIds: z.array(z.string()).min(1, 'At least one seat ID is required'),
});
