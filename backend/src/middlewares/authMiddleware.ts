import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      include: { roles: true },
    });

    if (!user) {
      return errorResponse(res, 401, 'Unauthorized: Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Unauthorized: Token expired or invalid');
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const userRole = req.user.roles?.name;
    const hasRole = roles.includes(userRole);

    if (!hasRole) {
      return errorResponse(res, 403, 'Forbidden: Insufficient permissions');
    }

    next();
  };
};
