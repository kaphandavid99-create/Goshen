import { canCustomerReceive } from "@/lib/order-status";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { createNotification } from "@/server/account/notifications";

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
      title: "Order received",
      body: `Thanks for confirming ${order.orderNumber}. You can review products on the order.`,
      href: `/account/orders/${order.id}`,
    });
    return Response.json({ order: updated });
  } catch {
    return jsonError("Unable to confirm receipt.", 503);
  }
}
