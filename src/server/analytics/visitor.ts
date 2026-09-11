import "server-only";

import { cookies } from "next/headers";
import { isProduction } from "@/lib/env";
import { createOpaqueToken } from "@/lib/auth/tokens";

const VISITOR_COOKIE = "goshen_visitor";

/**
 * Long-lived anonymous id for the admin "Visitors" stat — one per browser,
 * regardless of sign-in state, minted on first visit and reused after.
 */
export async function resolveVisitorId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = createOpaqueToken();
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
