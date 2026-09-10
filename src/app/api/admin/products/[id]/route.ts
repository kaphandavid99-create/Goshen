import { Prisma } from "@prisma/client";
import { adminProductPatchSchema } from "@/validators/admin";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia } from "@/server/media/cloudinary";

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
  const parsed = adminProductPatchSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Nothing to update.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const { bundleItems, ...fields } = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { kind: true },
  });
  if (!existing) {
    return jsonError("Product not found.", 404);
  }
  const isBundle = (fields.kind ?? existing.kind) === "BUNDLE";

  if (fields.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: fields.categoryId },
      select: { id: true },
    });
    if (!category) {
      return jsonError("That category no longer exists.", 400);
    }
  }

  let components: { productId: string; quantity: number }[] | null = null;
  if (bundleItems !== undefined) {
    if (!isBundle) {
      return jsonError("Only bundles can have products inside them.", 400);
    }
    if (bundleItems.length < 2) {
      return jsonError("A bundle needs at least two products.", 400);
    }
    const uniqueIds = [...new Set(bundleItems.map((item) => item.productId))];
    if (uniqueIds.length !== bundleItems.length) {
      return jsonError("A product is listed twice in the bundle.", 400);
    }
    const found = await prisma.product.findMany({
      where: { id: { in: uniqueIds }, kind: "SIMPLE" },
      select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
      return jsonError("One of the bundle products no longer exists.", 400);
    }
    components = bundleItems;
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: fields,
        select: {
          id: true,
          name: true,
          priceCents: true,
          unit: true,
          inStock: true,
          featured: true,
          categoryId: true,
          kind: true,
        },
      });

      if (components) {
        await tx.bundleItem.deleteMany({ where: { bundleId: id } });
        await tx.bundleItem.createMany({
          data: components.map((item, index) => ({
            bundleId: id,
            productId: item.productId,
            quantity: item.quantity,
            sortOrder: index,
          })),
        });
      }

      return updated;
    });

    return Response.json({ product });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("A product with that name already exists.", 409);
    }
    return jsonError("Unable to update this product.", 503);
  }
}

export async function DELETE(
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
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { select: { cloudinaryPublicId: true, resourceType: true } },
    },
  });

  if (!product) {
    return jsonError("Product not found.", 404);
  }

  await Promise.all(
    product.images
      .filter((image) => image.cloudinaryPublicId)
      .map((image) =>
        destroyMedia(
          image.cloudinaryPublicId as string,
          image.resourceType === "video" ? "video" : "image",
        ).catch(() => undefined),
      ),
  );

  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}
