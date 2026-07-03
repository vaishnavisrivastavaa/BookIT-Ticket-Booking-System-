import { z } from 'zod';

export const waitlistSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  category: z.enum(['PREMIUM', 'STANDARD']),
  numberOfSeats: z.number().int().positive('Number of seats must be positive'),
});
