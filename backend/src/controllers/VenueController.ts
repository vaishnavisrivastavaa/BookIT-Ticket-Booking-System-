import { Request, Response } from 'express';
import { VenueService } from '../services/VenueService';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export class VenueController {
  static async createVenue(req: AuthRequest, res: Response): Promise<any> {
    try {
      const adminId = req.user.id;
      const venue = await VenueService.createVenue(req.body, adminId);
      return successResponse(res, 201, 'Venue created successfully', venue);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getAllVenues(req: Request, res: Response): Promise<any> {
    try {
      const venues = await VenueService.getAllVenues();
      return successResponse(res, 200, 'Venues retrieved successfully', venues);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }
}
