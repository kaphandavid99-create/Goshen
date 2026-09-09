import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  fallbackCategories,
  fallbackProducts,
} from "@/server/catalog/data";
import { normalizeFlavorList } from "@/lib/flavors";
import { averageRating } from "@/lib/rating";
import type { CatalogProduct } from "@/types/catalog";

function withRating<T extends { reviews?: { rating: number }[] }>(
  product: T,
): Omit<T, "reviews"> & { rating: number | null; reviewCount: number } {
  const reviews = product.reviews ?? [];
  const { reviews: _reviews, ...rest } = product;
  return {
    ...rest,
    rating: averageRating(reviews.map((review) => review.rating)),
    reviewCount: reviews.length,
  };
}

function sortProducts(products: CatalogProduct[]) {
  return [...products].sort((left, right) => left.name.localeCompare(right.name));
}

export async function listCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    return fallbackCategories;
  }
}

export async function listProducts(categorySlug?: string, query?: string) {
  const normalizedQuery = query?.trim().toLowerCase();

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(normalizedQuery
          ? { name: { contains: normalizedQuery } }
          : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        reviews: { select: { rating: true } },
      },
      orderBy: { name: "asc" },
    });

    return products.map((product) =>
      withRating({ ...product, flavors: normalizeFlavorList(product.flavors) }),
    );
  } catch {
    // Catalog still renders from seed data when the database is unavailable.
  }

  const products = fallbackProducts.filter((product) => {
    const matchesCategory = categorySlug
      ? product.category.slug === categorySlug
      : true;
    const matchesQuery = normalizedQuery
      ? product.name.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesCategory && matchesQuery;
  });

  return sortProducts(products);
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (product) {
      return {
        product: { ...product, flavors: normalizeFlavorList(product.flavors) },
        fromDatabase: true as const,
      };
    }
  } catch {
    // Fall through to seed data.
  }

  const fallback = fallbackProducts.find((product) => product.id === id);
  return fallback
    ? { product: fallback, fromDatabase: false as const }
    : null;
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (product) {
      return { ...product, flavors: normalizeFlavorList(product.flavors) };
    }
  } catch {
    // Fall through to seed data.
  }

  return fallbackProducts.find((product) => product.slug === slug) ?? null;
}
