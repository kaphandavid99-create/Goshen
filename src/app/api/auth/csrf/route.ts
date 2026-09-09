import { CSRF_COOKIE_NAME, csrfCookieOptions } from "@/lib/auth/cookies";
import { issueCsrfToken } from "@/server/auth/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await issueCsrfToken();
  const options = csrfCookieOptions();
  const cookie = [
    `${CSRF_COOKIE_NAME}=${token}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=${options.sameSite}`,
    options.secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(JSON.stringify({ token }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": cookie,
    },
  });
}
