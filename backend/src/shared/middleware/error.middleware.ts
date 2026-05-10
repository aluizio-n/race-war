import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Validation Error',
      issues: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Registro duplicado', code: 'CONFLICT' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Registro não encontrado', code: 'NOT_FOUND' });
      return;
    }
  }

  const isDev = process.env.NODE_ENV === 'development';
  console.error('[ERROR]', err);

  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(isDev && { detail: err.message }),
  });
}
