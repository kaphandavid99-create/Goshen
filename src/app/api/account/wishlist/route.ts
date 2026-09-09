import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { toggleWishlist } from "@/server/account/hub";
import { wishlistToggleSchema } from "@/validators/account";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to save items.", 401);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = wishlistToggleSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Choose a product to save.", 400);
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true },
  });
  if (!product) {
    return jsonError("Product not found.", 404);
  }

  try {
    const result = await toggleWishlist(user.id, product.id);
    return Response.json(result);
  } catch {
    return jsonError("Unable to update your wishlist.", 503);
  }
}
