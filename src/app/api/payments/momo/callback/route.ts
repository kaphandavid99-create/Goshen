import { prisma } from "@/lib/db/prisma";
import { settlePayment } from "@/server/payments/settle";

export const runtime = "nodejs";

// MoMo calls this with the final status of a request-to-pay (when
// MOMO_CALLBACK_URL is set). We don't trust the body — we look the payment up
// by its reference id and re-check the status with MoMo via settlePayment.
// Polling from the checkout page is the primary mechanism; this just makes it
// resolve faster.
export async function PUT(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  let referenceId: string | null = null;
  try {
    const body = (await request.json()) as {
      referenceId?: string;
      externalId?: string;
    };
    referenceId = body.referenceId ?? null;
  } catch {
    referenceId = null;
  }

  if (!referenceId) {
    return Response.json({ ok: true });
  }

  const payment = await prisma.payment.findUnique({
    where: { momoReferenceId: referenceId },
    select: { id: true },
  });
  if (payment) {
    await settlePayment(payment.id).catch(() => undefined);
  }

  return Response.json({ ok: true });
}
