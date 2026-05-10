import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/AppError';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return secret;
}

// Access tokens: short-lived (default 15m). Override with JWT_EXPIRES_IN.
const ACCESS_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '15m') as string;
// Refresh tokens expiry in days. Override with REFRESH_TOKEN_EXPIRES_IN_DAYS.
export const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 30);

export interface JwtPayload {
  sub: string; // userId
  nickname: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: ACCESS_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}
