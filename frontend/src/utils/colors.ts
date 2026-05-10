import type { ActivityMode } from '../types';

export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#263548',
  border: '#334155',
  race: '#22C55E',
  bike: '#06B6D4',
  skate: '#A855F7',
  gold: '#F59E0B',
  danger: '#EF4444',
  white: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
} as const;

export const MODE_COLORS: Record<ActivityMode, string> = {
  race: COLORS.race,
  bike: COLORS.bike,
  skate: COLORS.skate,
};

export const MODE_GLOW: Record<ActivityMode, string> = {
  race: 'rgba(34,197,94,0.35)',
  bike: 'rgba(6,182,212,0.35)',
  skate: 'rgba(168,85,247,0.35)',
};

export const modeColor = (mode: ActivityMode) => MODE_COLORS[mode];
export const modeGlow = (mode: ActivityMode) => MODE_GLOW[mode];
