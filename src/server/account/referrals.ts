import "server-only";

import { randomInt } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { REFERRAL_POINTS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";

function makeReferralCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GOS";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[randomInt(alphabet.length)];
  }
  return code;
}

export async function createUniqueReferralCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const referralCode = makeReferralCode();
    const exists = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (!exists) {
      return referralCode;
    }
  }

  return `GOS${Date.now().toString(36).toUpperCase()}`;
}

export async function ensureReferralCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  const referralCode = await createUniqueReferralCode();
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode },
  });
  return referralCode;
}

export async function findReferrerByCode(code: string | undefined) {
  const referralCode = code?.trim().toUpperCase();
  if (!referralCode) {
    return null;
  }

  return prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });
}

export async function getUserPoints(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });
  return user?.points ?? 0;
}

export async function awardReferralOnPurchase(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const buyer = await tx.user.findUnique({
    where: { id: userId },
    select: {
      referredById: true,
      referralRewarded: true,
    },
  });

  if (
    !buyer?.referredById ||
    buyer.referralRewarded ||
    buyer.referredById === userId
  ) {
    return;
  }

  const completedOrders = await tx.order.count({
    where: {
      userId,
      status: { not: "CANCELLED" },
    },
  });

  if (completedOrders !== 1) {
    return;
  }

  await tx.user.update({
    where: { id: buyer.referredById },
    data: { points: { increment: REFERRAL_POINTS } },
  });
  await tx.user.update({
    where: { id: userId },
    data: { referralRewarded: true },
  });
  await createNotification(tx, {
    userId: buyer.referredById,
    title: "Referral reward",
    body: `A friend placed their first order. You earned ${REFERRAL_POINTS} points.`,
    href: "/account/rewards",
  });
}
