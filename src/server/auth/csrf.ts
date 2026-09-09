import "server-only";

import { cookies } from "next/headers";
import {
  CSRF_COOKIE_NAME,
  csrfCookieOptions,
  readCookieValue,
} from "@/lib/auth/cookies";
import { createOpaqueToken } from "@/lib/auth/tokens";

export async function issueCsrfToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existing) {
    return existing;
  }

  const token = createOpaqueToken();
  cookieStore.set(CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return token;
}

export async function readCsrfToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

export async function assertCsrf(request: Request) {
  const cookieToken =
    readCookieValue(request.headers.get("cookie"), CSRF_COOKIE_NAME) ??
    (await readCsrfToken());
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return false;
  }

  return true;
}
