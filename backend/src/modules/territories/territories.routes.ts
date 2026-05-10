import { Router } from 'express';
import { territoriesController } from './territories.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { listTerritoriesSchema } from './territories.schema';

const router = Router();

router.get('/', validate(listTerritoriesSchema, 'query'), (req, res, next) => territoriesController.list(req, res, next));
router.get('/my/stats', authMiddleware, (req, res, next) => territoriesController.getMyStats(req, res, next));
router.get('/user/:userId/stats', (req, res, next) => territoriesController.getUserStats(req, res, next));
router.get('/:id', (req, res, next) => territoriesController.getById(req, res, next));

export default router;
