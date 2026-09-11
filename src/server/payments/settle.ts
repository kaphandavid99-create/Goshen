import "server-only";

import { randomUUID } from "node:crypto";
import { spendPointsFor } from "@/lib/points";
import { prisma } from "@/lib/db/prisma";
import { createNotification, notifyStaffOfNewOrder } from "@/server/account/notifications";
import { awardReferralOnPurchase } from "@/server/account/referrals";
import { getRequestToPayStatus, requestToPay } from "@/server/payments/momo";

export type SettleResult = {
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  reason?: string | null;
};

// Pull the latest MoMo status for a pending payment and apply it. Safe to call
// repeatedly — the checkout page polls this and the MoMo callback hits it too.
export async function settlePayment(paymentId: string): Promise<SettleResult> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return { status: "FAILED", reason: "not found" };
  }
  if (payment.status === "SUCCEEDED") {
    return { status: "SUCCEEDED" };
  }
  if (payment.status === "FAILED") {
    return { status: "FAILED", reason: payment.failureReason };
  }
  if (payment.method !== "MOMO" || !payment.momoReferenceId) {
    return { status: "PENDING" };
  }

  let momo;
  try {
    momo = await getRequestToPayStatus(payment.momoReferenceId);
  } catch {
    // Transient — the caller polls again shortly.
    return { status: "PENDING" };
  }

  if (momo.status === "SUCCESSFUL") {
    await finalizePaidOrder(payment.id, momo.financialTransactionId);
    return { status: "SUCCEEDED" };
  }
  if (momo.status === "FAILED") {
    await failPayment(payment.id, momo.reason ?? "The payment was declined.");
    return { status: "FAILED", reason: momo.reason };
  }
  return { status: "PENDING" };
}

async function finalizePaidOrder(
  paymentId: string,
  financialId: string | null,
) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment || payment.status === "SUCCEEDED") {
      return;
    }
    const order = payment.order;

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCEEDED",
        paidAt: new Date(),
        momoFinancialId: financialId ?? payment.momoFinancialId,
        failureReason: null,
      },
    });

    if (order.status === "AWAITING_PAYMENT") {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PENDING" },
      });
    }

    const spendPoints = spendPointsFor(order.totalCents);
    if (spendPoints > 0) {
      await tx.user.update({
        where: { id: order.userId },
        data: { points: { increment: spendPoints } },
      });
    }
    await awardReferralOnPurchase(tx, order.userId);

    await createNotification(tx, {
      userId: order.userId,
      title: "Payment received",
      body: `${order.orderNumber} is paid — the shop will confirm it shortly.`,
      href: `/account/orders/${order.id}`,
    });
    await notifyStaffOfNewOrder(tx, order);
  });
}

async function failPayment(paymentId: string, reason: string) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment || payment.status !== "PENDING") {
      return;
    }
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason: reason.slice(0, 300) },
    });
    await createNotification(tx, {
      userId: payment.order.userId,
      title: "Payment not completed",
      body: `We couldn't collect payment for ${payment.order.orderNumber}. You can try again.`,
      href: `/pay/${payment.id}`,
    });
  });
}

// Re-issue a MoMo prompt for an order still waiting on payment.
export async function retryMomoPayment(paymentId: string): Promise<SettleResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment || payment.method !== "MOMO") {
    throw new Error("NOT_MOMO");
  }
  if (payment.status === "SUCCEEDED") {
    return { status: "SUCCEEDED" };
  }
  if (payment.order.status !== "AWAITING_PAYMENT") {
    throw new Error("ORDER_CLOSED");
  }

  const referenceId = randomUUID();
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PENDING",
      momoReferenceId: referenceId,
      failureReason: null,
      attempts: { increment: 1 },
    },
  });

  await requestToPay({
    referenceId,
    amount: payment.amountCents,
    phone: payment.phone ?? "",
    externalId: payment.order.orderNumber,
    payerMessage: `Goshen order ${payment.order.orderNumber}`,
    payeeNote: `Goshen order ${payment.order.orderNumber}`,
  });

  return { status: "PENDING" };
}

// Customer gave up on an unpaid order.
export async function cancelAwaitingOrder(paymentId: string) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment || payment.order.status !== "AWAITING_PAYMENT") {
      return;
    }
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason: "Cancelled by the customer." },
    });
    await tx.order.update({
      where: { id: payment.order.id },
      data: { status: "CANCELLED" },
    });
  });
}
