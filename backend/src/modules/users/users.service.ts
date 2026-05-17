import { prisma } from '../../shared/utils/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { socketManager } from '../../shared/ws/socket.manager';
import { sendPushToUser } from '../../shared/notifications/push.service';
import { notificationsService } from '../notifications/notifications.service';
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

    const [friendship, sender] = await Promise.all([
      prisma.friendship.create({ data: { senderId, receiverId } }),
      prisma.user.findUnique({ where: { id: senderId }, select: PUBLIC_SELECT }),
    ]);

    const payload = { friendship, sender };

    socketManager.emitToUser(receiverId, 'friend_request_received', payload);
    socketManager.emitToUser(senderId, 'friend_request_sent', payload);

    sendPushToUser(receiverId, {
      title: 'Nova solicitação de amizade',
      body: `${sender?.nickname ?? 'Alguém'} quer ser seu amigo no Race War!`,
      data: { type: 'friend_request_received', friendshipId: friendship.id, senderId },
    }).catch(() => {});

    notificationsService.create(receiverId, {
      type: 'friend_request',
      title: 'Nova solicitação de amizade',
      body: `${sender?.nickname ?? 'Alguém'} quer ser seu amigo!`,
      data: { senderId, friendshipId: friendship.id },
    }).catch(() => {});

    return friendship;
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    const friendRequest = await prisma.friendship.findFirst({
      where: { id: requestId, receiverId: userId },
    });
    if (!friendRequest) throw new NotFoundError('Solicitação de amizade');

    const [updated, acceptor] = await Promise.all([
      prisma.friendship.update({ where: { id: requestId }, data: { accepted: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_SELECT }),
    ]);

    const payload = { friendship: updated, acceptor };

    socketManager.emitToUser(friendRequest.senderId, 'friend_request_accepted', payload);
    socketManager.emitToUser(friendRequest.receiverId, 'friend_request_accepted', payload);

    sendPushToUser(friendRequest.senderId, {
      title: 'Solicitação aceita!',
      body: `${acceptor?.nickname ?? 'Seu amigo'} aceitou sua solicitação de amizade!`,
      data: { type: 'friend_request_accepted', friendshipId: updated.id },
    }).catch(() => {});

    notificationsService.create(friendRequest.senderId, {
      type: 'friend_accepted',
      title: 'Amizade aceita!',
      body: `${acceptor?.nickname ?? 'Seu amigo'} aceitou sua solicitação!`,
      data: { acceptorId: userId, friendshipId: updated.id },
    }).catch(() => {});

    return updated;
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
