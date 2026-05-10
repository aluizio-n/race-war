import { prisma } from '../../shared/utils/prisma';
import type { LeaderboardInput } from './leaderboard.schema';

export class LeaderboardService {
  async getGlobal(input: LeaderboardInput) {
    const grouped = await prisma.territory.groupBy({
      by: ['userId'],
      where: input.mode ? { mode: input.mode } : undefined,
      _sum: { areaM2: true },
      _count: true,
      orderBy: { _sum: { areaM2: 'desc' } },
      take: input.limit,
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map(g => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, nickname: true, avatarUrl: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return grouped.map((g, index) => ({
      rank: index + 1,
      user: userMap.get(g.userId),
      totalAreaM2: g._sum.areaM2 ?? 0,
      territoryCount: g._count,
    }));
  }

  async getMyRank(userId: string, mode?: string) {
    const myArea = await prisma.territory.aggregate({
      where: { userId, ...(mode && { mode: mode as any }) },
      _sum: { areaM2: true },
    });

    const myAreaM2 = myArea._sum.areaM2 ?? 0;

    const rank = await prisma.territory.groupBy({
      by: ['userId'],
      where: { ...(mode && { mode: mode as any }) },
      _sum: { areaM2: true },
      having: { areaM2: { _sum: { gt: myAreaM2 } } },
    });

    return { rank: rank.length + 1, totalAreaM2: myAreaM2 };
  }
}

export const leaderboardService = new LeaderboardService();
