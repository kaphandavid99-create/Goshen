import { MIN_REDEEM_POINTS, MIN_REDEEM_SUBTOTAL } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { createOrder } from "@/server/orders/create-order";
import { checkoutSchema } from "@/validators/order";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to place an order.", 401);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const order = await createOrder(user.id, parsed.data);
    return Response.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
        status: order.status,
      },
      payment: order.payment
        ? {
            id: order.payment.id,
            method: order.payment.method,
            status: order.payment.status,
          }
        : null,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("UNAVAILABLE:")) {
      return jsonError("One or more items are no longer available.", 409);
    }
    if (error instanceof Error && error.message === "REDEEM_NOT_ALLOWED") {
      return jsonError(
        `Points can be used on orders from ${formatPrice(MIN_REDEEM_SUBTOTAL)} when you have at least ${MIN_REDEEM_POINTS} points.`,
        400,
      );
    }

    return jsonError("Unable to place the order. Confirm the database is running.", 503);
  }
}
