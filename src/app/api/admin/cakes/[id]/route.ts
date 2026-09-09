import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia } from "@/server/media/cloudinary";
import { cakeItemSchema } from "@/validators/cakes";

async function requireStaffRequest(request: Request) {
  if (!(await assertCsrf(request))) {
    return { error: jsonError("Invalid or missing CSRF token.", 403) };
  }
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return { error: jsonError("Staff access required.", 403) };
  }
  return { user };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireStaffRequest(request);
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = cakeItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "Check the highlighted fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  try {
    const item = await prisma.cakeItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.priceCents !== undefined ? { priceCents: data.priceCents } : {}),
        ...(data.priceNote !== undefined
          ? { priceNote: data.priceNote || null }
          : {}),
        ...(data.featured !== undefined ? { featured: data.featured } : {}),
        ...(data.available !== undefined ? { available: data.available } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
    return Response.json({ item });
  } catch {
    return jsonError("Item not found.", 404);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireStaffRequest(request);
  if ("error" in guard) {
    return guard.error;
  }

  const { id } = await params;
  const item = await prisma.cakeItem.findUnique({ where: { id } });
  if (!item) {
    return jsonError("Item not found.", 404);
  }

  if (item.cloudinaryPublicId) {
    await destroyMedia(item.cloudinaryPublicId, "image").catch(() => undefined);
  }

  await prisma.cakeItem.delete({ where: { id } });
  return Response.json({ ok: true });
}
