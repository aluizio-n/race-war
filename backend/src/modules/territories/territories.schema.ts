import { z } from 'zod';

export const listTerritoriesSchema = z.object({
  mode: z.enum(['RACE', 'BIKE', 'SKATE']).optional(),
  userId: z.string().uuid().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().max(100).default(10),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListTerritoriesInput = z.infer<typeof listTerritoriesSchema>;
