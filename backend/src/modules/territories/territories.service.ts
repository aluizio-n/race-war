import { prisma } from '../../shared/utils/prisma';
import { NotFoundError } from '../../shared/errors/AppError';
import type { ListTerritoriesInput } from './territories.schema';

const TERRITORY_SELECT = {
  id: true,
  mode: true,
  polygon: true,
  areaM2: true,
  centerLat: true,
  centerLng: true,
  conqueredAt: true,
  user: { select: { id: true, nickname: true, name: true, avatarUrl: true } },
} as const;

export class TerritoriesService {
  async list(input: ListTerritoriesInput) {
    const skip = (input.page - 1) * input.limit;

    const where: Record<string, unknown> = {};
    if (input.mode) where.mode = input.mode;
    if (input.userId) where.userId = input.userId;

    const [items, total] = await Promise.all([
      prisma.territory.findMany({
        where,
        orderBy: { conqueredAt: 'desc' },
        skip,
        take: input.limit,
        select: TERRITORY_SELECT,
      }),
      prisma.territory.count({ where }),
    ]);

    return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
  }

  async getById(id: string) {
    const territory = await prisma.territory.findUnique({
      where: { id },
      select: { ...TERRITORY_SELECT, activity: { select: { distanceKm: true, durationSec: true, calories: true } } },
    });
    if (!territory) throw new NotFoundError('Território');
    return territory;
  }

  async getStats(userId: string) {
    const [byMode, totalArea, count] = await Promise.all([
      prisma.territory.groupBy({
        by: ['mode'],
        where: { userId },
        _sum: { areaM2: true },
        _count: true,
      }),
      prisma.territory.aggregate({ where: { userId }, _sum: { areaM2: true } }),
      prisma.territory.count({ where: { userId } }),
    ]);

    return {
      totalAreaM2: totalArea._sum.areaM2 ?? 0,
      totalCount: count,
      byMode: byMode.map(m => ({
        mode: m.mode,
        areaM2: m._sum.areaM2 ?? 0,
        count: m._count,
      })),
    };
  }
}

export const territoriesService = new TerritoriesService();
