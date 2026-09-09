import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { assertCsrf } from "@/server/auth/csrf";
import { clearAuthCookies, jsonError } from "@/server/auth/request";
import { revokeSession } from "@/server/auth/session";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const cookieStore = await cookies();
  await revokeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  await clearAuthCookies();

  return Response.json({ ok: true });
}
