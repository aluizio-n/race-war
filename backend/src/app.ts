import 'dotenv/config';
import express from 'express';
import path from 'path';
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
import notificationsRoutes from './modules/notifications/notifications.routes';

import { errorMiddleware } from './shared/middleware/error.middleware';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  }),
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Set CORS_ORIGIN to a comma-separated list of allowed origins (e.g. https://app.racewar.com)
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' não permitida`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev'));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.', code: 'TOO_MANY_REQUESTS' },
  }),
);
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite de requisições atingido. Tente novamente em breve.', code: 'TOO_MANY_REQUESTS' },
  }),
);

// ─── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ─── Swagger UI (development only) ────────────────────────────────────────────
if (!isProd) {
  // Loaded dynamically to keep prod bundle lean and avoid unsafe-inline CSP in prod
  Promise.all([
    import('swagger-ui-express'),
    import('swagger-jsdoc'),
    import('./docs/swagger'),
  ]).then(([swaggerUi, { default: swaggerJsdoc }, { default: swaggerOptions }]) => {
    const spec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(spec);
    });
  });
}

// ─── Static files (uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
app.use('/api/notifications', notificationsRoutes);

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', code: 'NOT_FOUND' });
});

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
