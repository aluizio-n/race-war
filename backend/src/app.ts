import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import territoriesRoutes from './modules/territories/territories.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import challengesRoutes from './modules/challenges/challenges.routes';

import { errorMiddleware } from './shared/middleware/error.middleware';

const app = express();

// ─── Security & Logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  '/api/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }),
);
app.use(
  '/api',
  rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }),
);

// ─── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/territories', territoriesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengesRoutes);

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
