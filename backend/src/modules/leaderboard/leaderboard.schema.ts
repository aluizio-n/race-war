import { z } from 'zod';

export const leaderboardSchema = z.object({
  mode: z.enum(['RACE', 'BIKE', 'SKATE']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type LeaderboardInput = z.infer<typeof leaderboardSchema>;
