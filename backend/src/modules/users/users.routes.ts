import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { usersController } from './users.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateProfileSchema, searchSchema } from './users.schema';

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', '..', 'uploads', 'avatars'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.use(authMiddleware);

router.get('/me', (req, res, next) => usersController.getMe(req, res, next));
router.patch('/me', validate(updateProfileSchema), (req, res, next) => usersController.update(req, res, next));
router.post('/me/avatar', avatarUpload.single('avatar'), (req, res, next) => usersController.uploadAvatar(req, res, next));
router.get('/search', validate(searchSchema, 'query'), (req, res, next) => usersController.search(req, res, next));
router.get('/friends', (req, res, next) => usersController.getFriends(req, res, next));
router.get('/friends/pending', (req, res, next) => usersController.getPendingRequests(req, res, next));
router.post('/friends/:id', (req, res, next) => usersController.sendFriendRequest(req, res, next));
router.patch('/friends/requests/:requestId/accept', (req, res, next) => usersController.acceptFriendRequest(req, res, next));
router.get('/:id', (req, res, next) => usersController.getById(req, res, next));

export default router;
