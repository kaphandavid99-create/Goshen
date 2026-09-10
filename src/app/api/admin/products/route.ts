import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { BUNDLES_CATEGORY_SLUG } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { adminProductCreateSchema } from "@/validators/admin";

async function uniqueSlug(name: string) {
  const base = slugify(name) || "product";
  let candidate = base;
  for (let attempt = 2; attempt < 50; attempt += 1) {
    const clash = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!clash) {
      return candidate;
    }
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = adminProductCreateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Check the product details.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const { bundleItems, kind, ...fields } = parsed.data;
  const isBundle = kind === "BUNDLE";

  // Bundles are always filed under the Bundles category.
  let categoryId = fields.categoryId;
  if (isBundle) {
    const bundlesCategory = await prisma.category.findUnique({
      where: { slug: BUNDLES_CATEGORY_SLUG },
      select: { id: true },
    });
    if (!bundlesCategory) {
      return jsonError(
        "The Bundles category is missing. Run the database migration.",
        500,
      );
    }
    categoryId = bundlesCategory.id;
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) {
    return jsonError("That category no longer exists.", 400);
  }

  let components: { productId: string; quantity: number }[] = [];
  if (isBundle) {
    components = bundleItems ?? [];
    const uniqueIds = [...new Set(components.map((item) => item.productId))];
    if (uniqueIds.length !== components.length) {
      return jsonError("A product is listed twice in the bundle.", 400);
    }
    const found = await prisma.product.findMany({
      where: { id: { in: uniqueIds }, kind: "SIMPLE" },
      select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
      return jsonError("One of the bundle products no longer exists.", 400);
    }
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...fields,
        categoryId,
        kind,
        slug: await uniqueSlug(fields.name),
        ...(isBundle
          ? {
              wholesalePriceCents: null,
              flavors: [],
              bundleItems: {
                create: components.map((item, index) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  sortOrder: index,
                })),
              },
            }
          : {}),
      },
      select: { id: true, slug: true },
    });
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("A product with that name already exists.", 409);
    }
    return jsonError("Unable to create this product.", 503);
  }
}
