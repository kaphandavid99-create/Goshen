import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import type { PublicUser, WholesaleStatus } from "@/types";

export type WholesaleViewer = {
  user: PublicUser | null;
  status: WholesaleStatus;
};

export async function getWholesaleViewer(): Promise<WholesaleViewer> {
  const user = await getCurrentUser();
  return {
    user,
    status: user?.wholesaleStatus ?? "NONE",
  };
}

/** For pages/APIs that only approved wholesale accounts may reach. */
export async function requireApprovedWholesale(nextPath = "/wholesale") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (user.wholesaleStatus !== "APPROVED") {
    redirect("/wholesale");
  }

  return user;
}
