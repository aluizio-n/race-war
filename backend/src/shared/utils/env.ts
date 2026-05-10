const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres');
  }
}
