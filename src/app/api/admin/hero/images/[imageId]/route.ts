import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia } from "@/server/media/cloudinary";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const { imageId } = await params;
  const image = await prisma.heroImage.findUnique({ where: { id: imageId } });

  if (!image) {
    return jsonError("Image not found.", 404);
  }

  if (image.cloudinaryPublicId) {
    await destroyMedia(image.cloudinaryPublicId, "image").catch(() => undefined);
  }

  await prisma.heroImage.delete({ where: { id: image.id } });
  return Response.json({ ok: true });
}
