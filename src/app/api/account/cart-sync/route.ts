import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";

/**
 * Lets the client mirror the signed-in customer's cart item count to the
 * server, purely so the cart-reminder cron (see server/orders/cart-reminders)
 * can tell an idle cart from an active one — the cart itself still lives in
 * the browser. Fire-and-forget from the client; failures here never affect
 * shopping.
 */
export async function PUT(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in required.", 401);
  }

  const body: unknown = await request.json().catch(() => null);
  const itemCount =
    body && typeof body === "object" && "itemCount" in body
      ? Number((body as { itemCount: unknown }).itemCount)
      : NaN;

  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > 10_000) {
    return jsonError("Invalid item count.", 400);
  }

  await prisma.cartSnapshot.upsert({
    where: { userId: user.id },
    create: { userId: user.id, itemCount },
    update: { itemCount, remindedAt: null },
  });

  return new Response(null, { status: 204 });
}

// Cart emptied (checkout or manually cleared) — nothing left to remind about.
export async function DELETE(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in required.", 401);
  }

  await prisma.cartSnapshot.deleteMany({ where: { userId: user.id } });

  return new Response(null, { status: 204 });
}
