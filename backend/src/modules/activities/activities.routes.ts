import { Router } from 'express';
import { activitiesController } from './activities.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { startActivitySchema, finishActivitySchema, listActivitiesSchema } from './activities.schema';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(startActivitySchema), (req, res, next) => activitiesController.start(req, res, next));
router.patch('/:id/finish', validate(finishActivitySchema), (req, res, next) => activitiesController.finish(req, res, next));
router.get('/', validate(listActivitiesSchema, 'query'), (req, res, next) => activitiesController.list(req, res, next));
router.get('/:id', (req, res, next) => activitiesController.getById(req, res, next));
router.delete('/:id', (req, res, next) => activitiesController.delete(req, res, next));

export default router;
