import { Router } from 'express';
import { WaitlistController } from '../controllers/WaitlistController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { waitlistSchema } from '../schemas/waitlistSchema';

const router = Router();

router.post('/', authenticate, authorize(['CUSTOMER']), validate(waitlistSchema), WaitlistController.joinWaitlist);

export default router;
