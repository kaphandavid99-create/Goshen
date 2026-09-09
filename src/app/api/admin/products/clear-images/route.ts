import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia } from "@/server/media/cloudinary";

export async function DELETE(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const images = await prisma.productImage.findMany({
    select: { id: true, cloudinaryPublicId: true, resourceType: true },
  });

  await Promise.all(
    images
      .filter((image) => image.cloudinaryPublicId)
      .map((image) =>
        destroyMedia(
          image.cloudinaryPublicId as string,
          image.resourceType === "video" ? "video" : "image",
        ).catch(() => undefined),
      ),
  );

  const { count } = await prisma.productImage.deleteMany({});
  return Response.json({ ok: true, deleted: count });
}
