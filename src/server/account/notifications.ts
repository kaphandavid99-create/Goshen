import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import { sendPushToUser } from "@/server/notifications/push";

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

  // Also push it to the person's phone/browser. Best effort — a failed or
  // slow push must never break the surrounding order/booking transaction.
  try {
    await sendPushToUser(input.userId, {
      title: input.title,
      body: input.body,
      url: input.href ?? "/account/notifications",
    });
  } catch {
    // swallowed on purpose
  }
}
