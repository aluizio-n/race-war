import { useState, useCallback, useRef } from 'react';
import type { ActivityMode, Coordinate, Activity } from '../types';
import { polygonArea } from '../utils/format';

export interface ActivityState {
  isActive: boolean;
  isPaused: boolean;
  mode: ActivityMode;
  route: Coordinate[];
  startTime: number | null;
  elapsed: number;
  distance: number;
  polygon: Coordinate[] | null;
  conquered: boolean;
}

const INITIAL: ActivityState = {
  isActive: false,
  isPaused: false,
  mode: 'race',
  route: [],
  startTime: null,
  elapsed: 0,
  distance: 0,
  polygon: null,
  conquered: false,
};

export function useActivityStore() {
  const [state, setState] = useState<ActivityState>(INITIAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((mode: ActivityMode) => {
    setState({ ...INITIAL, isActive: true, mode, startTime: Date.now() });
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, elapsed: prev.elapsed + 1 }));
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, elapsed: prev.elapsed + 1 }));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => ({ ...prev, isActive: false, isPaused: false }));
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(INITIAL);
  }, []);

  const addPoint = useCallback((coord: Coordinate) => {
    setState(prev => {
      const newRoute = [...prev.route, coord];
      let newDistance = prev.distance;
      if (newRoute.length > 1) {
        const last = newRoute[newRoute.length - 2];
        newDistance += haversine(last, coord);
      }

      // Check if polygon closes (distance to start < 30m and route has > 10 points)
      let polygon = prev.polygon;
      let conquered = prev.conquered;
      if (!conquered && newRoute.length > 10) {
        const dist = haversine(newRoute[0], coord) * 1000;
        if (dist < 30) {
          polygon = newRoute;
          conquered = true;
        }
      }

      return { ...prev, route: newRoute, distance: newDistance, polygon, conquered };
    });
  }, []);

  return { state, start, pause, resume, stop, reset, addPoint };
}

function haversine(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
