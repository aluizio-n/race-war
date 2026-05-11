import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(72, 'Senha não pode exceder 72 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(80),
  nickname: z
    .string()
    .min(3, 'Nickname deve ter pelo menos 3 caracteres')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Nickname só pode conter letras, números e _'),
  email: z.string().email('Email inválido').max(254),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(254),
  password: z.string().min(1, 'Senha obrigatória').max(72),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').max(254),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().uuid('Refresh token inválido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
