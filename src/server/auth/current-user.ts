import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { isSafeNextPath } from "@/lib/auth/safe-next";
import { isAllowedAdminEmail } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { getUserFromSessionToken } from "@/server/auth/session";
import type { PublicUser, UserRole } from "@/types";

/**
 * The email allowlist in ADMIN_EMAILS is the sole source of truth for admin
 * access. Reconcile the DB role to match it on every request that resolves a
 * signed-in user — promotes an allowed email straight to ADMIN, and demotes
 * anyone else off ADMIN/STAFF (closing off stale or seeded accounts, and any
 * role an account picked up before the allowlist existed). Only writes when
 * the stored role actually disagrees, so this is a no-op read in the common
 * case.
 */
async function reconcileAdminAccess(user: PublicUser): Promise<PublicUser> {
  const shouldBeAdmin = isAllowedAdminEmail(user.email);

  if (shouldBeAdmin && user.role !== "ADMIN") {
    await prisma.user
      .update({ where: { id: user.id }, data: { role: "ADMIN" } })
      .catch(() => undefined);
    return { ...user, role: "ADMIN" };
  }

  if (!shouldBeAdmin && isStaffRole(user.role)) {
    await prisma.user
      .update({ where: { id: user.id }, data: { role: "CUSTOMER" } })
      .catch(() => undefined);
    return { ...user, role: "CUSTOMER" };
  }

  return user;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const user = await getUserFromSessionToken(
      cookieStore.get(SESSION_COOKIE_NAME)?.value,
    );
    return user ? await reconcileAdminAccess(user) : null;
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
