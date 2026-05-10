import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

function log(level: 'warn' | 'error', req: Request, err: Error, status: number): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    method: req.method,
    path: req.path,
    status,
    error: err.name,
    message: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };
  if (level === 'error') {
    process.stderr.write(JSON.stringify(entry) + '\n');
  } else {
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    log('warn', req, err, err.statusCode);
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
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

  log('error', req, err, 500);
  res.status(500).json({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
}
