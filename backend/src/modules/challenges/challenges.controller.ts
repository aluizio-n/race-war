import { Request, Response, NextFunction } from 'express';
import { challengesService } from './challenges.service';
import type { AuthRequest } from '../../shared/middleware/auth.middleware';
import { ChallengeStatus } from '@prisma/client';

export class ChallengesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      const status = req.query.status as ChallengeStatus | undefined;
      res.json(await challengesService.listForUser(userId, status));
    } catch (err) { next(err); }
  }
}

export const challengesController = new ChallengesController();
