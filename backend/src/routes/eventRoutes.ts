import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { eventSchema } from '../schemas/eventSchema';

const router = Router();

router.post('/', authenticate, authorize(['ORGANISER', 'ADMIN']), validate(eventSchema), EventController.createEvent);
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.get('/:id/seats', EventController.getEventSeats);

export default router;
