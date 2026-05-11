import { prisma } from '../../shared/utils/prisma';
import { hashPassword, comparePassword } from '../../shared/utils/hash';
import { signToken, REFRESH_TOKEN_EXPIRES_DAYS } from '../../shared/utils/jwt';
import { ConflictError, TooManyRequestsError, UnauthorizedError } from '../../shared/errors/AppError';
import { recordFailedLogin, recordSuccessfulLogin, isLoginLocked } from '../../shared/middleware/login-limiter';
import type { RegisterInput, LoginInput } from './auth.schema';
import { randomUUID } from 'crypto';

export class AuthService {
  async register(input: RegisterInput) {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { nickname: input.nickname }] },
    });
    if (exists) {
      const field = exists.email === input.email ? 'email' : 'nickname';
      throw new ConflictError(`Este ${field} já está em uso`);
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: { name: input.name, nickname: input.nickname, email: input.email, passwordHash },
      select: { id: true, name: true, nickname: true, email: true, createdAt: true },
    });

    const accessToken = signToken({ sub: user.id, nickname: user.nickname });
    const refreshToken = await this.createRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput) {
    if (isLoginLocked(input.email)) {
      throw new TooManyRequestsError();
    }

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      recordFailedLogin(input.email);
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(input.email);
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    recordSuccessfulLogin(input.email);

    // Clean up expired refresh tokens for this user to prevent DB bloat
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });

    const accessToken = signToken({ sub: user.id, nickname: user.nickname });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: { id: user.id, name: user.name, nickname: user.nickname, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token inválido ou expirado');
    }

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = signToken({ sub: stored.user.id, nickname: stored.user.nickname });
    const newRefreshToken = await this.createRefreshToken(stored.user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
    return token;
  }
}

export const authService = new AuthService();
