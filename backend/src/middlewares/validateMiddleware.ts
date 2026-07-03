import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error && error.errors && Array.isArray(error.errors)) {
        const errors = error.errors.reduce((acc: any, curr: any) => {
          const path = curr.path[0] as string;
          if (!acc[path]) acc[path] = [];
          acc[path].push(curr.message);
          return acc;
        }, {});
        return errorResponse(res, 400, 'Validation failed', errors);
      }
      return errorResponse(res, 400, error.message || 'Invalid request body');
    }
  };
};
