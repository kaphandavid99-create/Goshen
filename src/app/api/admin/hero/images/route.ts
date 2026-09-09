import { isCloudinaryConfigured } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { uploadMedia } from "@/server/media/cloudinary";

const MAX_IMAGES = 6;

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

  const count = await prisma.heroImage.count();
  if (count >= MAX_IMAGES) {
    return jsonError(`Remove an image first — ${MAX_IMAGES} is the maximum.`, 400);
  }

  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim() || "Goshen hero image";

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Choose an image to upload.", 400);
  }

  try {
    const uploaded = await uploadMedia(file, {
      removeBackground: false,
      folder: "goshen/hero",
    });
    if (uploaded.resourceType !== "image") {
      return jsonError("The hero takes images only.", 400);
    }

    const last = await prisma.heroImage.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const image = await prisma.heroImage.create({
      data: {
        url: uploaded.url,
        alt,
        cloudinaryPublicId: uploaded.publicId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });

    return Response.json({ image }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload this file.";
    return jsonError(message, 400);
  }
}
