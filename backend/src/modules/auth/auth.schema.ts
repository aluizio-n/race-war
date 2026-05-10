import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(80),
  nickname: z
    .string()
    .min(3, 'Nickname deve ter pelo menos 3 caracteres')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname só pode conter letras, números e _'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(72),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
