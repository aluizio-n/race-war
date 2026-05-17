import { ActivityMode, ChallengeStatus, Prisma } from '@prisma/client';
import { prisma } from '../../shared/utils/prisma';
import { notificationsService } from '../notifications/notifications.service';

interface ActivityProgress {
  distanceKm: number;
  territories: number;
  areaM2: number;
}

export class ChallengesService {
  async listForUser(userId: string, status?: ChallengeStatus) {
    const now = new Date();

    const activeChallenges = await prisma.challenge.findMany({
      where: { startsAt: { lte: now }, expiresAt: { gt: now } },
    });

    const enrolledIds = await prisma.userChallenge
      .findMany({ where: { userId }, select: { challengeId: true } })
      .then(r => new Set(r.map(x => x.challengeId)));

    const toEnroll = activeChallenges.filter(c => !enrolledIds.has(c.id));
    if (toEnroll.length > 0) {
      await prisma.userChallenge.createMany({
        data: toEnroll.map(c => ({ userId, challengeId: c.id })),
        skipDuplicates: true,
      });
    }

    await prisma.userChallenge.updateMany({
      where: { userId, status: 'ACTIVE', challenge: { expiresAt: { lte: now } } },
      data: { status: 'EXPIRED' },
    });

    return prisma.userChallenge.findMany({
      where: { userId, ...(status && { status }) },
      include: { challenge: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProgressAfterActivity(
    userId: string,
    mode: ActivityMode,
    progress: ActivityProgress,
  ) {
    const userChallenges = await prisma.userChallenge.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { challenge: true },
    });

    for (const uc of userChallenges) {
      const { challenge } = uc;
      let increment = 0;

      if (challenge.unit === 'km') {
        if (!challenge.mode || challenge.mode === mode) increment = progress.distanceKm;
      } else if (challenge.unit === 'territories') {
        if (!challenge.mode || challenge.mode === mode) increment = progress.territories;
      } else if (challenge.unit === 'm2') {
        if (!challenge.mode || challenge.mode === mode) increment = progress.areaM2;
      } else if (challenge.unit === 'days') {
        // Use a serializable transaction to prevent double-counting concurrent activities
        await prisma.$transaction(async (tx) => {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const todayCount = await tx.activity.count({
            where: { userId, finishedAt: { gte: todayStart, not: null } },
          });

          if (todayCount === 1) {
            const current = await tx.userChallenge.findUnique({
              where: { id: uc.id },
              select: { currentValue: true },
            });
            if (!current) return;

            const newValue = Math.min(current.currentValue + 1, challenge.targetValue);
            const isCompleted = newValue >= challenge.targetValue;

            await tx.userChallenge.update({
              where: { id: uc.id },
              data: {
                currentValue: newValue,
                status: isCompleted ? 'COMPLETED' : 'ACTIVE',
                completedAt: isCompleted ? new Date() : null,
              },
            });

            if (isCompleted) {
              notificationsService.create(userId, {
                type: 'challenge_completed',
                title: 'Desafio concluído!',
                body: challenge.title,
                data: { challengeId: challenge.id },
              }).catch(() => {});
            }
          }
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

        continue;
      }

      if (increment <= 0) continue;

      const newValue = Math.min(uc.currentValue + increment, challenge.targetValue);
      const isCompleted = newValue >= challenge.targetValue;

      await prisma.userChallenge.update({
        where: { id: uc.id },
        data: {
          currentValue: newValue,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          completedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted) {
        notificationsService.create(userId, {
          type: 'challenge_completed',
          title: 'Desafio concluído!',
          body: challenge.title,
          data: { challengeId: challenge.id },
        }).catch(() => {});
      }
    }
  }
}

export const challengesService = new ChallengesService();
