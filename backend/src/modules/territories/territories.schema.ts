import { z } from 'zod';

export const listTerritoriesSchema = z.object({
  mode: z.enum(['RACE', 'BIKE', 'SKATE']).optional(),
  userId: z.string().uuid().optional(),
  lat: z.coerce.number().finite().min(-90).max(90).optional(),
  lng: z.coerce.number().finite().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(100).default(10),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListTerritoriesInput = z.infer<typeof listTerritoriesSchema>;
