import "server-only";

import { MIN_REDEEM_POINTS, POINTS_REMINDER_INTERVAL_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";

/**
 * Finds customers sitting on enough points to redeem who haven't been
 * reminded in `POINTS_REMINDER_INTERVAL_DAYS`, and nudges them to spend them.
 * Meant to run on a schedule (see /api/cron/points-reminder). Stamps
 * `lastPointsReminderAt` on every match so the same balance isn't re-notified
 * on every run; if they redeem down below the threshold the reminders simply
 * stop until they earn their way back up.
 */
export async function runPointsReminders() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - POINTS_REMINDER_INTERVAL_DAYS);

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      points: { gte: MIN_REDEEM_POINTS },
      OR: [{ lastPointsReminderAt: null }, { lastPointsReminderAt: { lte: cutoff } }],
    },
    select: { id: true, points: true },
  });

  for (const customer of customers) {
    await createNotification(prisma, {
      userId: customer.id,
      title: "Points ready to redeem",
      body: `You have ${customer.points} points. Use them as a discount at checkout.`,
      href: "/account/rewards",
    });

    await prisma.user.update({
      where: { id: customer.id },
      data: { lastPointsReminderAt: new Date() },
    });
  }

  return { notified: customers.length };
}
