import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isStaffRole, requireUser } from "@/server/auth/current-user";
import type { PublicUser } from "@/types";

async function grantAdmin(user: PublicUser): Promise<PublicUser> {
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });
  return { ...user, role: "ADMIN" };
}

export async function requireStaff() {
  const user = await requireUser("/admin");

  if (isStaffRole(user.role)) {
    return user;
  }

  const [oldest, activeSessions] = await Promise.all([
    prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    }),
    prisma.session.findMany({
      where: { expiresAt: { gt: new Date() } },
      select: { userId: true },
    }),
  ]);

  const signedInUserIds = new Set(activeSessions.map((session) => session.userId));
  const isOwner = oldest?.id === user.id;
  const isOnlySignedInUser = signedInUserIds.size === 1 && signedInUserIds.has(user.id);

  if (isOwner || isOnlySignedInUser) {
    return grantAdmin(user);
  }

  redirect("/account");
}
