import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateProfileSchema, searchSchema } from './users.schema';

const router = Router();

router.use(authMiddleware);

router.get('/me', (req, res, next) => usersController.getMe(req, res, next));
router.patch('/me', validate(updateProfileSchema), (req, res, next) => usersController.update(req, res, next));
router.get('/search', validate(searchSchema, 'query'), (req, res, next) => usersController.search(req, res, next));
router.get('/friends', (req, res, next) => usersController.getFriends(req, res, next));
router.get('/friends/pending', (req, res, next) => usersController.getPendingRequests(req, res, next));
router.post('/friends/:id', (req, res, next) => usersController.sendFriendRequest(req, res, next));
router.patch('/friends/requests/:requestId/accept', (req, res, next) => usersController.acceptFriendRequest(req, res, next));
router.get('/:id', (req, res, next) => usersController.getById(req, res, next));

export default router;
