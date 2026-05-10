import { Router } from 'express';
import { challengesController } from './challenges.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => challengesController.list(req, res, next));

export default router;
