import { Request, Response } from 'express';
import { SeatService } from '../services/SeatService';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export class SeatController {
  static async holdSeats(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user.id;
      const result = await SeatService.holdSeats(req.body, userId);
      return successResponse(res, 200, 'Seats held successfully', result);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }
}
