import { env, isProduction } from "@/lib/env";

export const SESSION_COOKIE_NAME = env.sessionCookieName;
export const CSRF_COOKIE_NAME = env.csrfCookieName;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.sessionMaxAgeSeconds,
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.sessionMaxAgeSeconds,
  };
}

export function readCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = part.slice(0, separator).trim();
    if (key !== name) {
      continue;
    }

    return decodeURIComponent(part.slice(separator + 1).trim());
  }

  return undefined;
}

export function expiredCookieOptions() {
  return {
    path: "/",
    maxAge: 0,
    secure: isProduction,
    sameSite: "lax" as const,
  };
}
