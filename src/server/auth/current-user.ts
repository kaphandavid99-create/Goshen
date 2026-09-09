import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { isSafeNextPath } from "@/lib/auth/safe-next";
import { getUserFromSessionToken } from "@/server/auth/session";
import type { UserRole } from "@/types";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    return await getUserFromSessionToken(
      cookieStore.get(SESSION_COOKIE_NAME)?.value,
    );
  } catch {
    return null;
  }
}

export async function requireUser(nextPath = "/account") {
  const user = await getCurrentUser();
  if (!user) {
    const next = isSafeNextPath(nextPath) ? nextPath : "/account";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return user;
}

export async function requireRole(roles: UserRole[], nextPath = "/account") {
  const user = await requireUser(nextPath);
  if (!roles.includes(user.role)) {
    redirect("/account");
  }
  return user;
}

export function isStaffRole(role: UserRole) {
  return role === "ADMIN" || role === "STAFF";
}
