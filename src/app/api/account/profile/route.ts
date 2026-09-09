import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { updateAccountProfile } from "@/server/account/hub";
import { profileUpdateSchema } from "@/validators/account";

export async function PATCH(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to update your profile.", 401);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const profile = await updateAccountProfile(user.id, parsed.data);
    return Response.json({ profile });
  } catch {
    return jsonError("Unable to update your profile.", 503);
  }
}
