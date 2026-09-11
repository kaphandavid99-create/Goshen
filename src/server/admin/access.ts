import "server-only";

import { redirect } from "next/navigation";
import { isStaffRole, requireUser } from "@/server/auth/current-user";

// Staff/admin status is decided solely by the ADMIN_EMAILS allowlist,
// reconciled onto the account's role in getCurrentUser() — see
// reconcileAdminAccess() in server/auth/current-user.ts.
export async function requireStaff() {
  const user = await requireUser("/admin");

  if (!isStaffRole(user.role)) {
    redirect("/account");
  }

  return user;
}
