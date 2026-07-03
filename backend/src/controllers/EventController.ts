import { Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

export class EventController {
  static async createEvent(req: AuthRequest, res: Response): Promise<any> {
    try {
      const organiserId = req.user.id;
      const event = await EventService.createEvent(req.body, organiserId);
      return successResponse(res, 201, 'Event created successfully', event);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getAllEvents(req: Request, res: Response): Promise<any> {
    try {
      const events = await EventService.getAllEvents();
      return successResponse(res, 200, 'Events retrieved successfully', events);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getEventById(req: Request, res: Response): Promise<any> {
    try {
      const eventId = req.params.id as string;
      const event = await EventService.getEventById(eventId);
      return successResponse(res, 200, 'Event retrieved successfully', event);
    } catch (error: any) {
      if (error.message === 'Event not found') return errorResponse(res, 404, error.message);
      return errorResponse(res, 400, error.message);
    }
  }

  static async getEventSeats(req: Request, res: Response): Promise<any> {
    try {
      const eventId = req.params.id as string;
      const seats = await EventService.getEventSeats(eventId);
      return successResponse(res, 200, 'Seats retrieved successfully', seats);
    } catch (error: any) {
      return errorResponse(res, 400, error.message);
    }
  }
}
