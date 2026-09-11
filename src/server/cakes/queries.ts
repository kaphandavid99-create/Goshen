import "server-only";

import { prisma } from "@/lib/db/prisma";
import { fallbackCakeItems } from "@/server/cakes/data";
import type { CakeItem } from "@/types/cakes";
import type { CakeBookingStatus } from "@prisma/client";

function sortItems(items: CakeItem[]) {
  return [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

/**
 * Public gallery — available items only. Falls back to sample photos only
 * when the database itself is unreachable; a menu the admin has genuinely
 * emptied out stays empty (the page shows its own "check back soon" state)
 * rather than quietly reappearing the same stock photos they just deleted.
 */
export async function listCakeItems(): Promise<CakeItem[]> {
  try {
    return await prisma.cakeItem.findMany({
      where: { available: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    return sortItems(fallbackCakeItems).filter((item) => item.available);
  }
}

/** Admin view — every item regardless of availability. */
export async function listAllCakeItems(): Promise<CakeItem[]> {
  try {
    return await prisma.cakeItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return sortItems(fallbackCakeItems);
  }
}

export async function getCakeItem(id: string) {
  try {
    return await prisma.cakeItem.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function listCakeBookings(status?: CakeBookingStatus) {
  return prisma.cakeBooking.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function countOpenCakeBookings() {
  try {
    return await prisma.cakeBooking.count({
      where: { status: { in: ["NEW", "CONTACTED", "CONFIRMED"] } },
    });
  } catch {
    return 0;
  }
}
