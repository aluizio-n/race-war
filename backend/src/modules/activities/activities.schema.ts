import { z } from 'zod';

const coordinateSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const startActivitySchema = z.object({
  mode: z.enum(['RACE', 'BIKE', 'SKATE']),
});

export const finishActivitySchema = z.object({
  route: z.array(coordinateSchema).min(2, 'Rota precisa ter pelo menos 2 pontos').max(10000),
  durationSec: z.number().int().positive().max(86400), // max 24h
  polygon: z.array(coordinateSchema).min(3).max(500).optional(),
});

export const activityParamSchema = z.object({
  id: z.string().uuid(),
});

export const listActivitiesSchema = z.object({
  mode: z.enum(['RACE', 'BIKE', 'SKATE']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type StartActivityInput = z.infer<typeof startActivitySchema>;
export type FinishActivityInput = z.infer<typeof finishActivitySchema>;
export type ListActivitiesInput = z.infer<typeof listActivitiesSchema>;
