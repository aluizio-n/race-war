export type ActivityMode = 'race' | 'bike' | 'skate';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Territory {
  id: string;
  userId: string;
  userName: string;
  mode: ActivityMode;
  polygon: Coordinate[];
  area: number; // in m²
  conqueredAt: string;
  color: string;
}

export interface Activity {
  id: string;
  mode: ActivityMode;
  route: Coordinate[];
  distance: number; // km
  duration: number; // seconds
  calories: number;
  pace: number; // min/km
  area?: number;
  conqueredAt: string;
  polygon?: Coordinate[];
}

export interface User {
  id: string;
  name: string;
  nickname: string;
  avatar?: string;
  totalArea: number;
  totalDistance: number;
  activities: Activity[];
  rank: number;
  badges: Badge[];
  preferredMode: ActivityMode;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number; // total area in m²
  mode?: ActivityMode;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  reward: Badge;
  expiresAt: string;
  mode?: ActivityMode;
}
