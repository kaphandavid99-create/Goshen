import "server-only";

import type { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { formatPrice } from "@/lib/money";
import { sendPushToUser } from "@/server/notifications/push";

type Db = Prisma.TransactionClient | PrismaClient;

const STAFF_ROLES = ["ADMIN", "STAFF"] satisfies UserRole[];

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

/**
 * Notify every staff/admin account (in-app + push) that a new order has come
 * in, so someone sees it on their phone even when the admin isn't open.
 */
export async function notifyStaffOfNewOrder(
  db: Db,
  order: { id: string; orderNumber: string; totalCents: number; fullName: string },
) {
  const staff = await db.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    select: { id: true },
  });

  await Promise.all(
    staff.map((s) =>
      createNotification(db, {
        userId: s.id,
        title: "New order",
        body: `${order.orderNumber} from ${order.fullName} — ${formatPrice(order.totalCents)}.`,
        href: `/admin/orders/${order.id}`,
      }),
    ),
  );
}
