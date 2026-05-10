import { z } from 'zod';

export const listChallengesSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'EXPIRED']).optional(),
});

export type ListChallengesInput = z.infer<typeof listChallengesSchema>;
