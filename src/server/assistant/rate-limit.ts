import "server-only";

/**
 * In-memory sliding-window limiter. Per Node process only — good enough for a
 * single-instance deployment; move to Redis if the app is ever scaled out.
 */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_IN_WINDOW = 15;

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_IN_WINDOW) {
    const oldest = recent[0] ?? now;
    return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return { ok: true, retryAfterSec: 0 };
}
