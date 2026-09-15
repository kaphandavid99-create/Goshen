// How recently a product must have been added to still count as "new" on
// the homepage and in the /shop?new=1 filter.
export const NEW_ARRIVAL_WINDOW_DAYS = 10;

export function isNewArrival(createdAt: string, now: Date = new Date()) {
  const ageMs = now.getTime() - new Date(createdAt).getTime();
  return ageMs >= 0 && ageMs <= NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
