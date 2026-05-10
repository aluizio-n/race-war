import { Request, Response, NextFunction } from 'express';
import { activitiesService } from './activities.service';
import type { AuthRequest } from '../../shared/middleware/auth.middleware';

export class ActivitiesController {
  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.status(201).json(await activitiesService.start(userId, req.body));
    } catch (err) { next(err); }
  }

  async finish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await activitiesService.finish(userId, String(req.params.id), req.body));
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await activitiesService.list(userId, req.query as any));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await activitiesService.getById(userId, String(req.params.id)));
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      await activitiesService.delete(userId, String(req.params.id));
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

export const activitiesController = new ActivitiesController();
