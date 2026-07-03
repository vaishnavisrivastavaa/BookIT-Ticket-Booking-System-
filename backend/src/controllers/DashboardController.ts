import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export class DashboardController {
  static async getStats(req: AuthRequest, res: Response): Promise<any> {
    try {
      const stats = await DashboardService.getStats(req.user);
      return successResponse(res, 200, 'Stats retrieved', stats);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }
}
