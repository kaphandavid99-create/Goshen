import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import {
  createWholesaleOrder,
  WholesaleOrderError,
} from "@/server/wholesale/create-order";
import { WHOLESALE } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import { wholesaleCheckoutSchema } from "@/validators/wholesale";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to place an order.", 401);
  }

  if (user.wholesaleStatus !== "APPROVED") {
    return jsonError("Your wholesale account is not approved.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = wholesaleCheckoutSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Check the highlighted fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const order = await createWholesaleOrder(user.id, parsed.data);
    return Response.json(
      {
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
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WholesaleOrderError) {
      if (error.message.startsWith("UNAVAILABLE:")) {
        return jsonError("One or more items are no longer available.", 409);
      }
      if (error.message === "BELOW_MIN_ORDER") {
        return jsonError(
          `Wholesale orders start at ${formatPrice(WHOLESALE.minOrderCents)}.`,
          400,
        );
      }
    }

    return jsonError("Unable to place the order. Confirm the database is running.", 503);
  }
}
