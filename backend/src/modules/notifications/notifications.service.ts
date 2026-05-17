import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/utils/prisma';
import { NotFoundError } from '../../shared/errors/AppError';
import type { SubscribePushInput, UnsubscribePushInput } from './notifications.schema';

interface CreateNotificationInput {
  type: string;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
}

export class NotificationsService {
  getVapidPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY ?? null };
  }

  async subscribe(userId: string, input: SubscribePushInput) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      update: { p256dh: input.keys.p256dh, auth: input.keys.auth, userId },
      create: {
        userId,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
    });
  }

  async unsubscribe(userId: string, input: UnsubscribePushInput) {
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint: input.endpoint },
    });
  }

  async create(userId: string, input: CreateNotificationInput) {
    return prisma.notification.create({
      data: { userId, ...input },
    });
  }

  async listForUser(userId: string, limit = 30, cursor?: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundError('Notificação');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

export const notificationsService = new NotificationsService();
