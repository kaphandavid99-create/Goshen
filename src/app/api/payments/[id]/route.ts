import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { MomoError } from "@/server/payments/momo";
import {
  cancelAwaitingOrder,
  retryMomoPayment,
  settlePayment,
} from "@/server/payments/settle";

export const runtime = "nodejs";

async function ownPayment(paymentId: string, userId: string) {
  return prisma.payment.findFirst({
    where: { id: paymentId, order: { userId } },
    select: {
      id: true,
      method: true,
      status: true,
      amountCents: true,
      currency: true,
      failureReason: true,
      order: {
        select: { id: true, orderNumber: true, status: true, totalCents: true },
      },
    },
  });
}

// Poll: check MoMo, apply any final status, return where things stand.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to view this payment.", 401);
  }

  const { id } = await params;
  const payment = await ownPayment(id, user.id);
  if (!payment) {
    return jsonError("Payment not found.", 404);
  }

  let result;
  try {
    result = await settlePayment(id);
  } catch (error) {
    return jsonError(
      error instanceof MomoError ? error.message : "Unable to check the payment.",
      error instanceof MomoError ? error.status : 502,
    );
  }

  const fresh = await ownPayment(id, user.id);
  return Response.json({
    payment: {
      id,
      method: payment.method,
      status: result.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      failureReason: fresh?.failureReason ?? result.reason ?? null,
    },
    order: fresh?.order ?? payment.order,
  });
}

// Actions: retry a failed MoMo prompt, or cancel the unpaid order.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to update this payment.", 401);
  }

  const { id } = await params;
  const payment = await ownPayment(id, user.id);
  if (!payment) {
    return jsonError("Payment not found.", 404);
  }

  const body = (await request.json().catch(() => ({}))) as { action?: string };

  if (body.action === "cancel") {
    await cancelAwaitingOrder(id);
    return Response.json({ ok: true, status: "CANCELLED" });
  }

  if (body.action === "retry") {
    try {
      const result = await retryMomoPayment(id);
      return Response.json({ ok: true, status: result.status });
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_CLOSED") {
        return jsonError("This order can no longer be paid.", 409);
      }
      if (error instanceof Error && error.message === "NOT_MOMO") {
        return jsonError("This is not a MoMo payment.", 400);
      }
      return jsonError(
        error instanceof MomoError ? error.message : "Unable to restart the payment.",
        error instanceof MomoError ? error.status : 502,
      );
    }
  }

  return jsonError("Unknown action.", 400);
}
