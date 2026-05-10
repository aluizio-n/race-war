import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import type { AuthRequest } from '../../shared/middleware/auth.middleware';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await usersService.getMe(userId));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(await usersService.getById(String(req.params.id)));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await usersService.update(userId, req.body));
    } catch (err) { next(err); }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string;
      res.json(await usersService.search(q));
    } catch (err) { next(err); }
  }

  async sendFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      const result = await usersService.sendFriendRequest(userId, String(req.params.id));
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async acceptFriendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await usersService.acceptFriendRequest(userId, String(req.params.requestId)));
    } catch (err) { next(err); }
  }

  async getFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await usersService.getFriends(userId));
    } catch (err) { next(err); }
  }

  async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req as AuthRequest;
      res.json(await usersService.getPendingRequests(userId));
    } catch (err) { next(err); }
  }
}

export const usersController = new UsersController();
