import { isCloudinaryConfigured } from "@/lib/env";
import { clearAccountAvatar, setAccountAvatar } from "@/server/account/hub";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { destroyMedia, uploadAvatar } from "@/server/media/cloudinary";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to update your photo.", 401);
  }

  if (!isCloudinaryConfigured()) {
    return jsonError("Photo uploads are not available right now.", 503);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Choose a photo to upload.", 400);
  }

  try {
    const uploaded = await uploadAvatar(file);
    const { previousPublicId } = await setAccountAvatar(user.id, {
      url: uploaded.url,
      publicId: uploaded.publicId,
    });

    if (previousPublicId && previousPublicId !== uploaded.publicId) {
      await destroyMedia(previousPublicId).catch(() => undefined);
    }

    return Response.json({ avatarUrl: uploaded.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload this photo.";
    return jsonError(message, 400);
  }
}

export async function DELETE(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to update your photo.", 401);
  }

  try {
    const { previousPublicId } = await clearAccountAvatar(user.id);
    if (previousPublicId) {
      await destroyMedia(previousPublicId).catch(() => undefined);
    }
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unable to remove your photo.", 503);
  }
}
