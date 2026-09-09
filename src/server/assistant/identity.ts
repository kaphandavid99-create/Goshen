import "server-only";

import { cookies } from "next/headers";
import { createOpaqueToken } from "@/lib/auth/tokens";
import { isProduction } from "@/lib/env";
import { getCurrentUser } from "@/server/auth/current-user";
import type { ThreadOwner } from "@/server/assistant/threads";

export const CHAT_ANON_COOKIE = "goshen_chat_anon";

/**
 * Resolve who the conversation belongs to. Signed-in users are keyed by user id;
 * everyone else gets a long-lived anonymous cookie so their thread persists.
 * `create` is false for read-only endpoints that must not mint a new cookie.
 */
export async function resolveOwner(create: boolean): Promise<ThreadOwner> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id, anonId: null };

  const jar = await cookies();
  let anonId = jar.get(CHAT_ANON_COOKIE)?.value ?? null;

  if (!anonId && create) {
    anonId = createOpaqueToken();
    jar.set(CHAT_ANON_COOKIE, anonId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
  }

  return { userId: null, anonId };
}
