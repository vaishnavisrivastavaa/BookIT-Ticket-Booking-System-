import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { createBookingSchema } from '../schemas/seatSchema';

const router = Router();

router.post('/', authenticate, authorize(['CUSTOMER']), validate(createBookingSchema), BookingController.createBooking);
router.get('/', authenticate, authorize(['CUSTOMER']), BookingController.getUserBookings);
router.post('/:id/cancel', authenticate, authorize(['CUSTOMER']), BookingController.cancelBooking);

export default router;
