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

/** Public gallery — available items only, seed data when the database is down. */
export async function listCakeItems(): Promise<CakeItem[]> {
  try {
    const items = await prisma.cakeItem.findMany({
      where: { available: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    if (items.length > 0) {
      return items;
    }
  } catch {
    // Fall through to seed data.
  }
  return sortItems(fallbackCakeItems).filter((item) => item.available);
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
