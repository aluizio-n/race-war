import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../errors/AppError';

export interface AuthRequest extends Request {
  userId: string;
  userNickname: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token ausente');
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  (req as AuthRequest).userId = payload.sub;
  (req as AuthRequest).userNickname = payload.nickname;

  next();
}
