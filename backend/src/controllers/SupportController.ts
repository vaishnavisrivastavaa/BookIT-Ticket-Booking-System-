import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { sendEmail } from '../utils/emailService';

export class SupportController {
  static async submitQuery(req: Request, res: Response): Promise<any> {
    try {
      const { email, query } = req.body;
      
      if (!email || !query) {
        return errorResponse(res, 400, 'Email and query are required');
      }

      // Send the email to the specific support address
      const subject = `New Support Query from ${email}`;
      const text = `You have received a new support query from BookIT Help Center.\n\nUser Email: ${email}\n\nQuery:\n${query}`;
      
      await sendEmail('2k23.it2310919@gmail.com', subject, text);

      return successResponse(res, 200, 'Query sent successfully', null);
    } catch (error: any) {
      console.error('Support query error:', error);
      return errorResponse(res, 500, 'Failed to send query');
    }
  }
}
