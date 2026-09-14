import { canCustomerReceive } from "@/lib/order-status";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { createNotification } from "@/server/account/notifications";
import { sendOrderReceiptEmail } from "@/server/email/order-receipt";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to confirm receipt.", 401);
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true, orderNumber: true },
  });

  if (!order) {
    return jsonError("Order not found.", 404);
  }

  if (!canCustomerReceive(order.status)) {
    return jsonError("You can confirm receipt after the shop accepts the order.", 409);
  }

  try {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
      select: { id: true, status: true, receivedAt: true },
    });
    await createNotification(prisma, {
      userId: user.id,
      title: "Receipt ready",
      body: `Thanks for confirming ${order.orderNumber}. Your receipt is ready to view or print for your records.`,
      href: `/account/orders/${order.id}/receipt`,
    });

    // Email the receipt. Best effort — a failed or unconfigured send must
    // never undo the receive-confirmation the customer just made.
    sendOrderReceiptEmail(order.id).catch((error) => {
      console.error("order receipt email failed", error);
    });

    return Response.json({ order: updated });
  } catch {
    return jsonError("Unable to confirm receipt.", 503);
  }
}
