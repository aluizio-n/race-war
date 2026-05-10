import { Request, Response, NextFunction } from 'express';
import { territoriesService } from './territories.service';
import type { AuthRequest } from '../../shared/middleware/auth.middleware';

export class TerritoriesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await territoriesService.list(req.query as any));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await territoriesService.getById(String(req.params.id)));
    } catch (err) { next(err); }
  }

  async getMyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await territoriesService.getStats(userId));
    } catch (err) { next(err); }
  }

  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await territoriesService.getStats(String(req.params.userId)));
    } catch (err) { next(err); }
  }
}

export const territoriesController = new TerritoriesController();
