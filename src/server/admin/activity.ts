import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

type Db = Prisma.TransactionClient | PrismaClient;

export type ActivityInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
};

/**
 * Records an admin audit-log entry. Never throws — logging must not be able to
 * fail a real mutation.
 */
export async function logActivity(db: Db, input: ActivityInput) {
  try {
    await db.adminActivity.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary.slice(0, 500),
      },
    });
  } catch {
    // swallow — the audit log is best-effort
  }
}
