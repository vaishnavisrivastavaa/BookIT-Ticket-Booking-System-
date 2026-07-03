import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export class BookingController {
  static async createBooking(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user.id;
      const booking = await BookingService.createBooking(req.body, userId);
      return successResponse(res, 201, 'Booking created successfully', booking);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getUserBookings(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user.id;
      const bookings = await BookingService.getUserBookings(userId);
      return successResponse(res, 200, 'Bookings retrieved', bookings);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async cancelBooking(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id as string;
      await BookingService.cancelBooking(bookingId, userId);
      return successResponse(res, 200, 'Booking cancelled successfully');
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }
}
