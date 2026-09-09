import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { markNotificationsRead } from "@/server/account/hub";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to update notifications.", 401);
  }

  try {
    await markNotificationsRead(user.id);
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unable to update notifications.", 503);
  }
}
