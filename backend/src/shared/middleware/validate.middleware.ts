import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(422).json({
        error: 'Validation Error',
        issues: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    req[target] = result.data;
    next();
  };
}
