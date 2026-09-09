import "server-only";

import { env } from "@/lib/env";
import { createOpaqueToken, hashToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db/prisma";
import type { PublicUser } from "@/types";

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: PublicUser["role"];
  wholesaleStatus: PublicUser["wholesaleStatus"];
  avatarUrl: string | null;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    wholesaleStatus: user.wholesaleStatus,
    avatarUrl: user.avatarUrl,
  };
}

export async function createSession(input: {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}) {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + env.sessionMaxAgeSeconds * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: input.userId,
      expiresAt,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
    },
  });

  return { token, expiresAt };
}

export async function getUserFromSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          wholesaleStatus: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }

  return toPublicUser(session.user);
}

export async function revokeSession(token: string | undefined) {
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
}
