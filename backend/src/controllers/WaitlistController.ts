import { Request, Response } from 'express';
import { WaitlistService } from '../services/WaitlistService';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export class WaitlistController {
  static async joinWaitlist(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user.id;
      const waitlist = await WaitlistService.joinWaitlist(req.body, userId);
      return successResponse(res, 201, 'Joined waitlist successfully', waitlist);
    } catch (error: any) {
      if (error.message === 'You are already on the waitlist for this event') {
        return errorResponse(res, 409, error.message);
      }
      return errorResponse(res, 400, error.message);
    }
  }
}
