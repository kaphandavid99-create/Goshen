import "server-only";

import { prisma } from "@/lib/db/prisma";

/**
 * Returns whether this is the first time the user has opened their dashboard.
 * The first call for a user stamps `welcomedAt`, so every later call returns
 * `false` — the caller shows "Welcome" once, then "Welcome back".
 */
export async function consumeFirstDashboardVisit(userId: string) {
  try {
    const result = await prisma.user.updateMany({
      where: { id: userId, welcomedAt: null },
      data: { welcomedAt: new Date() },
    });
    return result.count === 1;
  } catch {
    return false;
  }
}
