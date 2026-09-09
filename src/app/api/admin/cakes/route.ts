import { isCloudinaryConfigured } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { uploadMedia } from "@/server/media/cloudinary";
import { NIPZ } from "@/lib/constants";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  if (!isCloudinaryConfigured()) {
    return jsonError("Add Cloudinary keys to .env, then restart the app.", 503);
  }

  const form = await request.formData();
  const file = form.get("file");
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const category = String(form.get("category") ?? "").trim() || NIPZ.categories[0];
  const priceRaw = String(form.get("price") ?? "").trim();
  const priceNote = String(form.get("priceNote") ?? "").trim();
  const featured = form.get("featured") === "on" || form.get("featured") === "true";

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Choose a photo to upload.", 400);
  }
  if (name.length < 2) {
    return jsonError("Enter a name for this item.", 400);
  }
  if (description.length < 10) {
    return jsonError("Add a short description.", 400);
  }

  const price = priceRaw ? Number(priceRaw.replace(/[^\d]/g, "")) : NaN;
  const priceCents = Number.isFinite(price) && price > 0 ? Math.round(price) : null;

  try {
    const uploaded = await uploadMedia(file, {
      removeBackground: false,
      folder: "goshen/cakes",
    });
    if (uploaded.resourceType !== "image") {
      return jsonError("The gallery takes photos only.", 400);
    }

    const last = await prisma.cakeItem.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const item = await prisma.cakeItem.create({
      data: {
        name,
        description,
        category,
        priceCents,
        priceNote: priceNote || null,
        imageUrl: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
        featured,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });

    return Response.json({ item }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload this file.";
    return jsonError(message, 400);
  }
}
