import "server-only";

/**
 * In-memory sliding-window limiter for the page-view beacon. Per Node process
 * only — good enough for a single-instance deployment. Generous window since
 * real browsing can fire several navigations in quick succession; this is
 * only meant to blunt obvious flooding, not throttle genuine visitors.
 */
const WINDOW_MS = 60 * 1000;
const MAX_IN_WINDOW = 60;

const hits = new Map<string, number[]>();

export function checkVisitRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_IN_WINDOW) {
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return true;
}
