import { prisma } from '../../shared/utils/prisma';
import type { SubscribePushInput, UnsubscribePushInput } from './notifications.schema';

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
}

export const notificationsService = new NotificationsService();
