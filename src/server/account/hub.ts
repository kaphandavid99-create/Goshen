import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function getAccountProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      points: true,
      createdAt: true,
      googleId: true,
    },
  });
}

export async function setAccountAvatar(
  userId: string,
  avatar: { url: string; publicId: string },
) {
  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: avatar.url, avatarPublicId: avatar.publicId },
  });

  return { previousPublicId: previous?.avatarPublicId ?? null };
}

export async function clearAccountAvatar(userId: string) {
  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, avatarPublicId: null },
  });

  return { previousPublicId: previous?.avatarPublicId ?? null };
}

export async function updateAccountProfile(
  userId: string,
  input: { name: string; phone: string | null },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(
  userId: string,
  input: {
    label: string;
    fullName: string;
    phone: string;
    line: string;
    isDefault: boolean;
  },
) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } });
    const isDefault = input.isDefault || count === 0;

    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        label: input.label,
        fullName: input.fullName,
        phone: input.phone,
        line: input.line,
        isDefault,
      },
    });
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: {
    label: string;
    fullName: string;
    phone: string;
    line: string;
    isDefault: boolean;
  },
) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { id: true },
  });
  if (!existing) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        label: input.label,
        fullName: input.fullName,
        phone: input.phone,
        line: input.line,
        isDefault: input.isDefault,
      },
    });
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });
    if (existing.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await tx.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return true;
}

export async function listWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            category: true,
            reviews: { select: { rating: true } },
          },
        },
      },
    orderBy: { createdAt: "desc" },
  });
}

export async function listWishlistProductIds(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return items.map((item) => item.productId);
}

export async function isInWishlist(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return Boolean(item);
}

export async function toggleWishlist(userId: string, productId: string) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.wishlistItem.create({
    data: { userId, productId },
  });
  return { saved: true };
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
