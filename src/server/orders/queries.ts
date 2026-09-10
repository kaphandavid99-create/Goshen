import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function listOrdersForUser(userId: string) {
  try {
    return await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export const orderItemBundleInclude = {
  product: {
    select: {
      kind: true,
      bundleItems: {
        orderBy: { sortOrder: "asc" as const },
        include: { product: { select: { name: true, unit: true } } },
      },
    },
  },
};

export async function getOrderForUser(userId: string, orderId: string) {
  try {
    return await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: orderItemBundleInclude },
        reviews: true,
        testimonial: true,
      },
    });
  } catch {
    return null;
  }
}
