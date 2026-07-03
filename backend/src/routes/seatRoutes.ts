import { Router } from 'express';
import { SeatController } from '../controllers/SeatController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { holdSeatsSchema } from '../schemas/seatSchema';

const router = Router();

console.log('seatRoutes evaluate:', {
  SeatController: typeof SeatController,
  holdSeats: typeof SeatController?.holdSeats,
  authenticate: typeof authenticate,
  authorize: typeof authorize,
  validate: typeof validate,
  holdSeatsSchema: typeof holdSeatsSchema
});

router.post('/hold', authenticate, authorize(['CUSTOMER']), validate(holdSeatsSchema), SeatController.holdSeats);

export default router;
