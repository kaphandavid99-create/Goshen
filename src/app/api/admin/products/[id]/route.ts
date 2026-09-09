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

  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });
    if (!category) {
      return jsonError("That category no longer exists.", 400);
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        priceCents: true,
        unit: true,
        inStock: true,
        featured: true,
        categoryId: true,
      },
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
