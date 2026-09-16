import "server-only";

import { CART_REMINDER_DELAY_HOURS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";

/**
 * Finds signed-in customers whose cart (synced from the client — see
 * /api/account/cart-sync) has sat untouched for `CART_REMINDER_DELAY_HOURS`+
 * and nudges them back to it. Meant to run on a schedule (see
 * /api/cron/cart-reminders) — currently once daily, since Vercel's Hobby
 * plan only allows daily-or-less-frequent crons; the idle threshold itself
 * still checks against `CART_REMINDER_DELAY_HOURS`, so upgrading to an
 * hourly cron later (Pro plan) needs no code change here, just vercel.json.
 * A snapshot is only reminded about once per idle stretch: every cart-sync
 * write clears `remindedAt` back to null, so a cart only matches here again
 * once it has changed since its last reminder.
 */
export async function runCartReminders() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - CART_REMINDER_DELAY_HOURS);

  const snapshots = await prisma.cartSnapshot.findMany({
    where: {
      itemCount: { gt: 0 },
      updatedAt: { lte: cutoff },
      remindedAt: null,
    },
    select: { id: true, userId: true, itemCount: true },
  });

  for (const snapshot of snapshots) {
    await createNotification(prisma, {
      userId: snapshot.userId,
      title: "Still thinking it over?",
      body:
        snapshot.itemCount === 1
          ? "You left an item waiting in your cart."
          : `You left ${snapshot.itemCount} items waiting in your cart.`,
      href: "/cart",
    });

    await prisma.cartSnapshot.update({
      where: { id: snapshot.id },
      data: { remindedAt: new Date() },
    });
  }

  return { checked: snapshots.length, notified: snapshots.length };
}
