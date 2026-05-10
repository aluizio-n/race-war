export interface Coordinate {
  latitude: number;
  longitude: number;
}

export function haversineKm(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function polygonAreaM2(coords: Coordinate[]): number {
  if (coords.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const xi = toRad(coords[i].longitude);
    const yi = toRad(coords[i].latitude);
    const xj = toRad(coords[j].longitude);
    const yj = toRad(coords[j].latitude);
    area += xi * Math.sin(yj);
    area -= xj * Math.sin(yi);
  }
  return Math.abs((area * R * R) / 2);
}

export function polygonCenter(coords: Coordinate[]): Coordinate {
  const lat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c.longitude, 0) / coords.length;
  return { latitude: lat, longitude: lng };
}

export function routeTotalDistanceKm(route: Coordinate[]): number {
  let d = 0;
  for (let i = 1; i < route.length; i++) {
    d += haversineKm(route[i - 1], route[i]);
  }
  return d;
}

// ─── Speed validation ──────────────────────────────────────────────────────────

// Max average speed and max distance per GPS segment allowed per activity mode.
// Segment limit assumes GPS polling every ~10s; anything beyond this is a GPS jump / vehicle use.
export const SPEED_LIMITS = {
  RACE:  { avgKmh: 25, segmentKm: 0.30 }, // elite sprinter sustained / 300 m jump tolerance
  SKATE: { avgKmh: 35, segmentKm: 0.40 }, // fast street skating
  BIKE:  { avgKmh: 60, segmentKm: 0.60 }, // urban/road cycling
} as const;

export type ActivityMode = keyof typeof SPEED_LIMITS;

export interface SpeedViolation {
  type: 'avg_speed' | 'teleportation';
  avgSpeedKmh: number;
  maxAllowedKmh: number;
  segmentIndex?: number;
  segmentDistanceKm?: number;
}

/**
 * Validates whether a route is humanly plausible for the given mode.
 * Returns a SpeedViolation if the route fails, or null if it is valid.
 *
 * Two checks:
 *  1. Teleportation — any single GPS segment exceeds the per-mode cap.
 *     Catches GPS spoofing / fake jumps even if the average looks fine.
 *  2. Average speed — total distance / total time exceeds the per-mode cap.
 *     Catches vehicle use that teleportation alone might miss (e.g. many small steps).
 */
export function validateRouteSpeed(
  route: Coordinate[],
  durationSec: number,
  mode: ActivityMode,
): SpeedViolation | null {
  if (route.length < 2 || durationSec <= 0) return null;

  const limits = SPEED_LIMITS[mode];
  let totalDistanceKm = 0;

  for (let i = 1; i < route.length; i++) {
    const segmentKm = haversineKm(route[i - 1], route[i]);
    totalDistanceKm += segmentKm;

    if (segmentKm > limits.segmentKm) {
      return {
        type: 'teleportation',
        avgSpeedKmh: round1(totalDistanceKm / durationSec * 3600),
        maxAllowedKmh: limits.avgKmh,
        segmentIndex: i,
        segmentDistanceKm: round3(segmentKm),
      };
    }
  }

  const avgSpeedKmh = totalDistanceKm / durationSec * 3600;
  if (avgSpeedKmh > limits.avgKmh) {
    return {
      type: 'avg_speed',
      avgSpeedKmh: round1(avgSpeedKmh),
      maxAllowedKmh: limits.avgKmh,
    };
  }

  return null;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
