import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import type { LoginInput, RegisterInput } from './auth.schema';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterInput);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginInput);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      await authService.logout(refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
