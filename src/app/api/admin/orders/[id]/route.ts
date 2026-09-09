import { canAdminSetStatus } from "@/lib/order-status";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { createNotification } from "@/server/account/notifications";
import { adminOrderStatusSchema } from "@/validators/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = adminOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Choose a valid order status.", 400);
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, acceptedAt: true, userId: true, orderNumber: true },
  });

  if (!existing) {
    return jsonError("Order not found.", 404);
  }

  if (!canAdminSetStatus(existing.status, parsed.data.status)) {
    return jsonError("This order can no longer be updated.", 409);
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: parsed.data.status,
        acceptedAt:
          parsed.data.status === "CONFIRMED"
            ? (existing.acceptedAt ?? new Date())
            : existing.acceptedAt,
      },
      select: { id: true, status: true, orderNumber: true },
    });

    await createNotification(prisma, {
      userId: existing.userId,
      title: parsed.data.status === "CONFIRMED" ? "Order confirmed" : "Order cancelled",
      body:
        parsed.data.status === "CONFIRMED"
          ? `${order.orderNumber} is confirmed. Mark it received when it arrives.`
          : `${order.orderNumber} was cancelled.`,
      href: `/account/orders/${order.id}`,
    });

    return Response.json({ order });
  } catch {
    return jsonError("Unable to update this order.", 503);
  }
}
