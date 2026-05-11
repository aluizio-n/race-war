// In-memory brute-force protection per email.
// For multi-instance deployments, replace with a Redis-backed store.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface Entry {
  count: number;
  lockedUntil: number | null;
}

const store = new Map<string, Entry>();

export function recordFailedLogin(email: string): void {
  const now = Date.now();
  const entry = store.get(email) ?? { count: 0, lockedUntil: null };

  if (entry.lockedUntil && entry.lockedUntil < now) {
    store.set(email, { count: 1, lockedUntil: null });
    return;
  }

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
  store.set(email, entry);
}

export function recordSuccessfulLogin(email: string): void {
  store.delete(email);
}

export function isLoginLocked(email: string): boolean {
  const now = Date.now();
  const entry = store.get(email);
  if (!entry) return false;
  if (entry.lockedUntil && entry.lockedUntil > now) return true;
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    store.delete(email);
  }
  return false;
}
