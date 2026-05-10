import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/AppError';

const SECRET = process.env.JWT_SECRET ?? 'fallback-secret-do-not-use-in-production';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  sub: string; // userId
  nickname: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}
