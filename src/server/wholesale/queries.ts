import "server-only";

import { prisma } from "@/lib/db/prisma";

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
} as const;

export type WholesaleCatalogProduct = Awaited<
  ReturnType<typeof listWholesaleProducts>
>[number];

export async function listWholesaleProducts() {
  return prisma.product.findMany({
    where: {
      inStock: true,
      wholesalePriceCents: { not: null },
    },
    include: productInclude,
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getWholesaleProduct(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      wholesalePriceCents: { not: null },
    },
    include: productInclude,
  });
}

export async function getMyWholesaleApplication(userId: string) {
  return prisma.wholesaleApplication.findUnique({
    where: { userId },
  });
}
