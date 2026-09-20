import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia, uploadMedia } from "@/server/media/cloudinary";
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
  const contentType = request.headers.get("content-type") ?? "";

  let body: unknown;
  let photo: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    // The full edit form resubmits every field (plus an optional new photo),
    // unlike the JSON path used by the quick Hide/Show and Feature toggles.
    const form = await request.formData();
    const file = form.get("file");
    if (file instanceof File && file.size > 0) {
      photo = file;
    }
    const priceRaw = String(form.get("price") ?? "").trim();
    const price = priceRaw ? Number(priceRaw.replace(/[^\d]/g, "")) : NaN;
    body = {
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      category: String(form.get("category") ?? "").trim(),
      priceCents: Number.isFinite(price) && price > 0 ? Math.round(price) : null,
      priceNote: String(form.get("priceNote") ?? "").trim(),
      featured: form.get("featured") === "true",
      available: form.get("available") === "true",
    };
  } else {
    body = await request.json().catch(() => null);
  }

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
    const previous = photo
      ? await prisma.cakeItem.findUnique({ where: { id }, select: { cloudinaryPublicId: true } })
      : null;

    let newImage: { imageUrl: string; cloudinaryPublicId: string } | null = null;
    if (photo) {
      const uploaded = await uploadMedia(photo, {
        removeBackground: false,
        folder: "goshen/cakes",
      });
      if (uploaded.resourceType !== "image") {
        return jsonError("The gallery takes photos only.", 400);
      }
      newImage = { imageUrl: uploaded.url, cloudinaryPublicId: uploaded.publicId };
    }

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
        ...(newImage ?? {}),
      },
    });

    if (newImage && previous?.cloudinaryPublicId) {
      await destroyMedia(previous.cloudinaryPublicId, "image").catch(() => undefined);
    }

    return Response.json({ item });
  } catch (error) {
    if (error instanceof Error && photo) {
      return jsonError(error.message, 400);
    }
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
