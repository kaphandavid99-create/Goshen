import "server-only";

import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { ensureReferralCode } from "@/server/account/referrals";
import { listOrdersForUser } from "@/server/orders/queries";

export async function getCustomerDashboard(userId: string) {
  const referralCode = await ensureReferralCode(userId).catch(() => null);

  const profile = await prisma.user
    .findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        points: true,
        referralCode: true,
        wholesaleStatus: true,
      },
    })
    .catch(() => null);

  const orders = await listOrdersForUser(userId);
  const active = orders.filter((order) => order.status !== "CANCELLED");
  const pending = active.filter((order) => order.status === "PENDING");
  const spent = active.reduce((total, order) => total + order.totalCents, 0);
  const itemCount = active.reduce(
    (total, order) =>
      total + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  const productTotals = new Map<
    string,
    { name: string; slug: string; quantity: number }
  >();

  for (const order of active) {
    for (const item of order.items) {
      const current = productTotals.get(item.slug);
      productTotals.set(item.slug, {
        name: item.name,
        slug: item.slug,
        quantity: (current?.quantity ?? 0) + item.quantity,
      });
    }
  }

  const favorites = [...productTotals.values()]
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 4);

  const latest = orders[0] ?? null;
  const lastDelivery = active.find(
    (order) => order.fulfillment === "DELIVERY" && order.address,
  );
  const lastContact = active.find((order) => order.phone);

  const referredFriends = await prisma.user
    .findMany({
      where: { referredById: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        referralRewarded: true,
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const code = profile?.referralCode ?? referralCode;
  const invitePath = code ? `/register?ref=${code}` : "/register";

  return {
    profile,
    orders,
    latest,
    lastDelivery,
    lastContact,
    favorites,
    referredFriends,
    referral: {
      code,
      path: invitePath,
      url: `${env.appUrl}${invitePath}`,
      signedUp: referredFriends.length,
      completed: referredFriends.filter((friend) => friend.referralRewarded).length,
    },
    stats: {
      orderCount: orders.length,
      pendingCount: pending.length,
      spent,
      itemCount,
      points: profile?.points ?? 0,
      deliveries: active.filter((order) => order.fulfillment === "DELIVERY").length,
      pickups: active.filter((order) => order.fulfillment === "PICKUP").length,
    },
  };
}
