import "server-only";

import { cookies } from "next/headers";
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  csrfCookieOptions,
  expiredCookieOptions,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { createOpaqueToken } from "@/lib/auth/tokens";

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

export async function setAuthCookies(sessionToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions());
  cookieStore.set(CSRF_COOKIE_NAME, createOpaqueToken(), csrfCookieOptions());
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...expiredCookieOptions(),
    httpOnly: true,
  });
  cookieStore.set(CSRF_COOKIE_NAME, "", expiredCookieOptions());
}

export function jsonError(
  message: string,
  status: number,
  fieldErrors?: Record<string, string[] | undefined>,
) {
  return Response.json({ error: message, fieldErrors }, { status });
}
