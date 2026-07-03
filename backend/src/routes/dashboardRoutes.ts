import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.get('/stats', authenticate, authorize(['ADMIN', 'ORGANISER']), DashboardController.getStats);

export default router;
