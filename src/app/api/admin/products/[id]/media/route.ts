import { isCloudinaryConfigured } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { uploadMedia } from "@/server/media/cloudinary";

export async function POST(
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

  if (!isCloudinaryConfigured()) {
    return jsonError("Add Cloudinary keys to .env, then restart the app.", 503);
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!product) {
    return jsonError("Product not found.", 404);
  }

  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim() || product.name;

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Choose an image or video to upload.", 400);
  }

  try {
    const uploaded = await uploadMedia(file, { removeBackground: true });
    const last = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const media = await prisma.productImage.create({
      data: {
        productId: id,
        url: uploaded.url,
        alt,
        cloudinaryPublicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });

    return Response.json({ media }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload this file.";
    return jsonError(message, 400);
  }
}
