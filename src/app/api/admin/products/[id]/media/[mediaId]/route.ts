import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia } from "@/server/media/cloudinary";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const { id, mediaId } = await params;
  const media = await prisma.productImage.findFirst({
    where: { id: mediaId, productId: id },
  });

  if (!media) {
    return jsonError("Media not found.", 404);
  }

  if (media.cloudinaryPublicId) {
    const type = media.resourceType === "video" ? "video" : "image";
    await destroyMedia(media.cloudinaryPublicId, type).catch(() => undefined);
  }

  await prisma.productImage.delete({ where: { id: media.id } });
  return Response.json({ ok: true });
}
