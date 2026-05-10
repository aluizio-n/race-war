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

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
