import { prisma } from '../../shared/utils/prisma';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import {
  routeTotalDistanceKm,
  polygonAreaM2,
  polygonCenter,
  validateRouteSpeed,
} from '../../shared/utils/geo';
import { socketManager } from '../../shared/ws/socket.manager';
import type { StartActivityInput, FinishActivityInput, ListActivitiesInput } from './activities.schema';
import { challengesService } from '../challenges/challenges.service';

export class ActivitiesService {
  async start(userId: string, input: StartActivityInput) {
    return prisma.activity.create({
      data: {
        userId,
        mode: input.mode,
        route: [],
        startedAt: new Date(),
      },
    });
  }

  async finish(userId: string, activityId: string, input: FinishActivityInput) {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new NotFoundError('Atividade');
    if (activity.userId !== userId) throw new ForbiddenError();

    const distanceKm = routeTotalDistanceKm(input.route);
    const paceMinKm = distanceKm > 0 ? input.durationSec / 60 / distanceKm : null;
    const calories = Math.round(
      (input.durationSec / 60) * (activity.mode === 'RACE' ? 10 : activity.mode === 'BIKE' ? 7 : 6),
    );

    // Validate speed before any territory or challenge logic
    const speedViolation = validateRouteSpeed(input.route, input.durationSec, activity.mode);

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: {
        route: input.route as object[],
        distanceKm,
        durationSec: input.durationSec,
        calories,
        paceMinKm,
        finishedAt: new Date(),
      },
    });

    // Speed violation: block territory creation and challenge progress, notify client
    if (speedViolation) {
      socketManager.emitToUser(userId, 'speed_violation', {
        activityId,
        mode: activity.mode,
        ...speedViolation,
      });

      return { activity: updated, territory: null, speedViolation };
    }

    // Create territory if polygon provided and speed is valid
    let territory = null;
    if (input.polygon && input.polygon.length >= 3) {
      const areaM2 = polygonAreaM2(input.polygon);
      const center = polygonCenter(input.polygon);

      territory = await prisma.territory.create({
        data: {
          userId,
          activityId,
          mode: activity.mode,
          polygon: input.polygon as object[],
          areaM2,
          centerLat: center.latitude,
          centerLng: center.longitude,
        },
      });

      challengesService
        .updateProgressAfterActivity(userId, activity.mode, { distanceKm, territories: 1, areaM2 })
        .catch(console.error);
    } else {
      challengesService
        .updateProgressAfterActivity(userId, activity.mode, { distanceKm, territories: 0, areaM2: 0 })
        .catch(console.error);
    }

    return { activity: updated, territory, speedViolation: null };
  }

  async list(userId: string, input: ListActivitiesInput) {
    const skip = (input.page - 1) * input.limit;

    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId, ...(input.mode && { mode: input.mode }), finishedAt: { not: null } },
        orderBy: { startedAt: 'desc' },
        skip,
        take: input.limit,
        include: { territory: { select: { areaM2: true } } },
      }),
      prisma.activity.count({
        where: { userId, ...(input.mode && { mode: input.mode }), finishedAt: { not: null } },
      }),
    ]);

    return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
  }

  async getById(userId: string, activityId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { territory: true },
    });
    if (!activity) throw new NotFoundError('Atividade');
    if (activity.userId !== userId) throw new ForbiddenError();
    return activity;
  }

  async delete(userId: string, activityId: string) {
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new NotFoundError('Atividade');
    if (activity.userId !== userId) throw new ForbiddenError();
    await prisma.activity.delete({ where: { id: activityId } });
  }
}

export const activitiesService = new ActivitiesService();
