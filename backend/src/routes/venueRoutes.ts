import { Router } from 'express';
import { VenueController } from '../controllers/VenueController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { venueSchema } from '../schemas/venueSchema';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN']), validate(venueSchema), VenueController.createVenue);
router.get('/', VenueController.getAllVenues);

export default router;
