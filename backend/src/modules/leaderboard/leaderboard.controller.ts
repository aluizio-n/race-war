import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from './leaderboard.service';
import type { AuthRequest } from '../../shared/middleware/auth.middleware';

export class LeaderboardController {
  async getGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await leaderboardService.getGlobal(req.query as any));
    } catch (err) { next(err); }
  }

  async getMyRank(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      const mode = req.query.mode as string | undefined;
      res.json(await leaderboardService.getMyRank(userId, mode));
    } catch (err) { next(err); }
  }
}

export const leaderboardController = new LeaderboardController();
