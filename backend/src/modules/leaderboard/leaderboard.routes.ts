import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { leaderboardSchema } from './leaderboard.schema';

const router = Router();

router.get('/', validate(leaderboardSchema, 'query'), (req, res, next) => leaderboardController.getGlobal(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => leaderboardController.getMyRank(req, res, next));

export default router;
