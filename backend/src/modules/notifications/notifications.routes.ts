import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { subscribePushSchema, unsubscribePushSchema } from './notifications.schema';

const router = Router();

router.get('/vapid-public-key', (req, res) =>
  notificationsController.getVapidPublicKey(req, res),
);

router.post(
  '/push/subscribe',
  authMiddleware,
  validate(subscribePushSchema),
  (req, res, next) => notificationsController.subscribe(req, res, next),
);

router.delete(
  '/push/subscribe',
  authMiddleware,
  validate(unsubscribePushSchema),
  (req, res, next) => notificationsController.unsubscribe(req, res, next),
);

export default router;
