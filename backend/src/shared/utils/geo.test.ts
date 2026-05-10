import { describe, it, expect } from 'vitest';
import { validateRouteSpeed, haversineKm, SPEED_LIMITS } from './geo';
import type { Coordinate } from './geo';

// ─── haversineKm ─────────────────────────────────────────────────────────────

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    const p = { latitude: -23.5505, longitude: -46.6333 };
    expect(haversineKm(p, p)).toBe(0);
  });

  it('returns ~111 km between two points 1° apart in latitude', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 1, longitude: 0 };
    expect(haversineKm(a, b)).toBeCloseTo(111.19, 0);
  });
});

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Builds a straight route of N+1 points spaced `stepKm` apart horizontally. */
function straightRoute(stepKm: number, steps: number): Coordinate[] {
  const origin = { latitude: -23.5505, longitude: -46.6333 };
  // 1 degree longitude ≈ 111 km × cos(lat). At -23.55°: ~102 km/deg
  const degPerKm = 1 / (111 * Math.cos((origin.latitude * Math.PI) / 180));
  const route: Coordinate[] = [origin];
  for (let i = 1; i <= steps; i++) {
    route.push({ latitude: origin.latitude, longitude: origin.longitude + stepKm * i * degPerKm });
  }
  return route;
}

/**
 * Duration for a route of `totalDistanceKm` at exactly `speedKmh`.
 */
function durationAt(totalDistanceKm: number, speedKmh: number): number {
  return Math.round((totalDistanceKm / speedKmh) * 3600);
}

// ─── validateRouteSpeed ───────────────────────────────────────────────────────

describe('validateRouteSpeed – RACE', () => {
  const limit = SPEED_LIMITS.RACE;

  it('returns null for a valid walking pace', () => {
    const steps = 20;
    const stepKm = 0.05; // 50m per segment
    const route = straightRoute(stepKm, steps);
    const totalKm = stepKm * steps;
    const duration = durationAt(totalKm, 12); // 12 km/h jog — well within limit
    expect(validateRouteSpeed(route, duration, 'RACE')).toBeNull();
  });

  it('returns avg_speed violation when average speed exceeds limit', () => {
    const steps = 10;
    const stepKm = 0.10; // 100m segments — within segment limit
    const route = straightRoute(stepKm, steps);
    const totalKm = stepKm * steps;
    const duration = durationAt(totalKm, limit.avgKmh + 5); // 5 km/h over limit
    const result = validateRouteSpeed(route, duration, 'RACE');
    expect(result?.type).toBe('avg_speed');
    expect(result?.avgSpeedKmh).toBeGreaterThan(limit.avgKmh);
    expect(result?.maxAllowedKmh).toBe(limit.avgKmh);
  });

  it('returns teleportation when a single segment exceeds the segment cap', () => {
    const route: Coordinate[] = [
      { latitude: -23.5505, longitude: -46.6333 },
      { latitude: -23.5505, longitude: -46.6333 + 0.01 }, // ~1 km jump — over 0.30 km limit
      { latitude: -23.5505, longitude: -46.6333 + 0.015 },
    ];
    const duration = 3600; // 1 hour — avg speed would look fine
    const result = validateRouteSpeed(route, duration, 'RACE');
    expect(result?.type).toBe('teleportation');
    expect(result?.segmentIndex).toBe(1);
  });

  it('returns null for a route with exactly 1 point', () => {
    const route = [{ latitude: -23.5505, longitude: -46.6333 }];
    expect(validateRouteSpeed(route, 600, 'RACE')).toBeNull();
  });

  it('returns null for durationSec = 0', () => {
    const route = straightRoute(0.05, 5);
    expect(validateRouteSpeed(route, 0, 'RACE')).toBeNull();
  });
});

describe('validateRouteSpeed – BIKE', () => {
  const limit = SPEED_LIMITS.BIKE;

  it('returns null for a valid cycling speed', () => {
    const steps = 30;
    const stepKm = 0.15; // 150m segments — within 600m limit
    const route = straightRoute(stepKm, steps);
    const totalKm = stepKm * steps;
    const duration = durationAt(totalKm, 30); // 30 km/h — well within 60 km/h limit
    expect(validateRouteSpeed(route, duration, 'BIKE')).toBeNull();
  });

  it('catches car-level speed (100 km/h average)', () => {
    const steps = 10;
    const stepKm = 0.20;
    const route = straightRoute(stepKm, steps);
    const totalKm = stepKm * steps;
    const duration = durationAt(totalKm, 100); // 100 km/h → over 60 km/h limit
    const result = validateRouteSpeed(route, duration, 'BIKE');
    expect(result?.type).toBe('avg_speed');
    expect(result?.avgSpeedKmh).toBeCloseTo(100, 0);
  });

  it('catches GPS teleportation even with slow average speed', () => {
    // 10 very short segments then one huge jump, average still looks slow
    const route: Coordinate[] = [
      ...straightRoute(0.05, 10), // 500m of legitimate points
      { latitude: -22.0, longitude: -43.0 }, // teleport ~200 km away
    ];
    const duration = 7200; // 2 hours — avg is low
    const result = validateRouteSpeed(route, duration, 'BIKE');
    expect(result?.type).toBe('teleportation');
  });
});

describe('validateRouteSpeed – SKATE', () => {
  const limit = SPEED_LIMITS.SKATE;

  it('returns null for a normal skateboarding session', () => {
    const steps = 15;
    const stepKm = 0.08;
    const route = straightRoute(stepKm, steps);
    const totalKm = stepKm * steps;
    const duration = durationAt(totalKm, 20);
    expect(validateRouteSpeed(route, duration, 'SKATE')).toBeNull();
  });

  it('flags motorcycle-level speed', () => {
    const steps = 10;
    const stepKm = 0.10;
    const route = straightRoute(stepKm, steps);
    const totalKm = stepKm * steps;
    const duration = durationAt(totalKm, limit.avgKmh + 20);
    const result = validateRouteSpeed(route, duration, 'SKATE');
    expect(result?.type).toBe('avg_speed');
  });
});
