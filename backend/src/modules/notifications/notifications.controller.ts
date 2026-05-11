import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import type { AuthRequest } from '../../shared/middleware/auth.middleware';

export class NotificationsController {
  getVapidPublicKey(_req: Request, res: Response): void {
    res.json(notificationsService.getVapidPublicKey());
  }

  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.status(201).json(await notificationsService.subscribe(userId, req.body));
    } catch (err) {
      next(err);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      await notificationsService.unsubscribe(userId, req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
