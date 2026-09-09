import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

type Db = Prisma.TransactionClient | PrismaClient;

export async function createNotification(
  db: Db,
  input: {
    userId: string;
    title: string;
    body: string;
    href?: string | null;
  },
) {
  await db.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
    },
  });
}
