import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  nickname: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const userParamSchema = z.object({
  id: z.string().uuid(),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(50),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
