import { DRINK_FLAVORS } from "@/lib/constants";

const KNOWN = new Set<string>(DRINK_FLAVORS);

/**
 * Coerce a stored `Product.flavors` JSON value into a clean list of flavour
 * names, keeping only the ones we recognise and preserving canonical order.
 */
export function normalizeFlavorList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const picked = new Set<string>();
  for (const entry of value) {
    if (typeof entry === "string" && KNOWN.has(entry)) picked.add(entry);
  }
  return DRINK_FLAVORS.filter((flavor) => picked.has(flavor));
}

/**
 * Coerce a stored `OrderItem.flavors` / cart flavour value into a
 * `{ flavour: quantity }` map with positive integer quantities only.
 */
export function normalizeFlavorQuantities(
  value: unknown,
  allowed?: string[],
): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allow = allowed ? new Set(allowed) : null;
  const out: Record<string, number> = {};
  for (const [name, raw] of Object.entries(value as Record<string, unknown>)) {
    if (allow && !allow.has(name)) continue;
    if (!allow && !KNOWN.has(name)) continue;
    const qty = Math.floor(Number(raw));
    if (Number.isFinite(qty) && qty > 0) out[name] = qty;
  }
  return out;
}

export function flavorQuantityTotal(map: Record<string, number>): number {
  return Object.values(map).reduce((sum, qty) => sum + qty, 0);
}

/** "Orange × 6 · Cocktail × 3" — canonical order, for display. */
export function formatFlavorSummary(map: Record<string, number>): string {
  return DRINK_FLAVORS.filter((flavor) => map[flavor] > 0)
    .map((flavor) => `${flavor} × ${map[flavor]}`)
    .join(" · ");
}
