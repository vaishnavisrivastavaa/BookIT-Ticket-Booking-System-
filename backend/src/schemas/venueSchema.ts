import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  seats: z.array(
    z.object({
      category: z.enum(['PREMIUM', 'STANDARD']),
      rowPrefix: z.string().length(1, 'Row prefix must be 1 character'),
      seatCount: z.number().int().positive('Seat count must be positive'),
    })
  ).min(1, 'At least one seat configuration is required'),
});
