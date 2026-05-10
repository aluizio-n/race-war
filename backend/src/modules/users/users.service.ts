import { prisma } from '../../shared/utils/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import type { UpdateProfileInput } from './users.schema';

const PUBLIC_SELECT = {
  id: true,
  name: true,
  nickname: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export class UsersService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...PUBLIC_SELECT,
        email: true,
        _count: { select: { territories: true, activities: true } },
      },
    });
    if (!user) throw new NotFoundError('Usuário');

    const totalArea = await prisma.territory.aggregate({
      where: { userId },
      _sum: { areaM2: true },
    });

    return { ...user, totalAreaM2: totalArea._sum.areaM2 ?? 0 };
  }

  async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...PUBLIC_SELECT,
        _count: { select: { territories: true, activities: true } },
      },
    });
    if (!user) throw new NotFoundError('Usuário');

    const totalArea = await prisma.territory.aggregate({
      where: { userId },
      _sum: { areaM2: true },
    });

    return { ...user, totalAreaM2: totalArea._sum.areaM2 ?? 0 };
  }

  async update(userId: string, input: UpdateProfileInput) {
    if (input.nickname) {
      const existing = await prisma.user.findUnique({ where: { nickname: input.nickname } });
      if (existing && existing.id !== userId) throw new ConflictError('Nickname já em uso');
    }

    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: PUBLIC_SELECT,
    });
  }

  async search(q: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { nickname: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: PUBLIC_SELECT,
      take: 20,
    });
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new ConflictError('Não pode se adicionar');

    const existing = await prisma.friendship.findFirst({
      where: { OR: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }] },
    });
    if (existing) throw new ConflictError('Solicitação já existe');

    return prisma.friendship.create({ data: { senderId, receiverId } });
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const req = await prisma.friendship.findFirst({ where: { id: requestId, receiverId: userId } });
    if (!req) throw new NotFoundError('Solicitação de amizade');

    return prisma.friendship.update({ where: { id: requestId }, data: { accepted: true } });
  }

  async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: { accepted: true, OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: PUBLIC_SELECT },
        receiver: { select: PUBLIC_SELECT },
      },
    });

    return friendships.map(f => (f.senderId === userId ? f.receiver : f.sender));
  }

  async getPendingRequests(userId: string) {
    return prisma.friendship.findMany({
      where: { receiverId: userId, accepted: false },
      include: { sender: { select: PUBLIC_SELECT } },
    });
  }
}

export const usersService = new UsersService();
