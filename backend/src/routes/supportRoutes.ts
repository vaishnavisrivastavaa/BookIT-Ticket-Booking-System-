import { Router } from 'express';
import { SupportController } from '../controllers/SupportController';

const router = Router();

router.post('/query', SupportController.submitQuery);

export default router;
