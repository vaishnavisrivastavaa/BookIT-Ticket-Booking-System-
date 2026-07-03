import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response): Promise<any> {
    try {
      const data = await AuthService.register(req.body);
      return successResponse(res, 201, 'User registered successfully', data);
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        return errorResponse(res, 409, error.message);
      }
      return errorResponse(res, 400, error.message);
    }
  }

  static async login(req: Request, res: Response): Promise<any> {
    try {
      const data = await AuthService.login(req.body);
      return successResponse(res, 200, 'User logged in successfully', data);
    } catch (error: any) {
      return errorResponse(res, 401, error.message);
    }
  }
}
