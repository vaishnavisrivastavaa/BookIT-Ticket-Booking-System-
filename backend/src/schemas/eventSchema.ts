import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  venueId: z.string().min(1, 'Venue ID is required'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  prices: z.array(
    z.object({
      category: z.enum(['PREMIUM', 'STANDARD']),
      price: z.number().min(0, 'Price must be greater than or equal to 0'),
    })
  ).min(1, 'At least one price configuration is required'),
});
