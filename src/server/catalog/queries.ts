import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  fallbackCategories,
  fallbackProducts,
} from "@/server/catalog/data";
import { normalizeFlavorList } from "@/lib/flavors";
import { averageRating } from "@/lib/rating";
import type { BundleComponent, CatalogProduct } from "@/types/catalog";

function withRating<T extends { reviews?: { rating: number }[] }>(
  product: T,
): Omit<T, "reviews"> & { rating: number | null; reviewCount: number } {
  const ratings = (product.reviews ?? []).map((review) => review.rating);
  const { reviews, ...rest } = product;
  void reviews;
  return {
    ...rest,
    rating: averageRating(ratings),
    reviewCount: ratings.length,
  };
}

function sortProducts(products: CatalogProduct[]) {
  return [...products].sort((left, right) => left.name.localeCompare(right.name));
}

// Prisma include used wherever a bundle's contents are needed.
export const bundleItemsInclude = {
  orderBy: { sortOrder: "asc" as const },
  include: {
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        unit: true,
        inStock: true,
        images: {
          orderBy: { sortOrder: "asc" as const },
          take: 1,
          select: { url: true },
        },
      },
    },
  },
};

type PrismaBundleItem = {
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    unit: string;
    inStock: boolean;
    images: { url: string }[];
  };
};

function mapBundleComponents(items: PrismaBundleItem[]): BundleComponent[] {
  return items.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    slug: item.product.slug,
    unit: item.product.unit,
    quantity: item.quantity,
    imageUrl: item.product.images[0]?.url ?? null,
    inStock: item.product.inStock,
  }));
}

/** A bundle sells only while it is switched on AND every product in it is in stock. */
function bundleInStock(ownInStock: boolean, components: BundleComponent[]) {
  return (
    ownInStock &&
    components.length > 0 &&
    components.every((component) => component.inStock)
  );
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
        // Bundles have their own area (/bundles) and never appear in the grid.
        kind: "SIMPLE",
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(normalizedQuery
          ? { name: { contains: normalizedQuery, mode: "insensitive" } }
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
    if (product.kind !== "SIMPLE") return false;
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

/** Every bundle, with its contents and effective stock. Empty on DB error. */
export async function listBundles(): Promise<CatalogProduct[]> {
  try {
    const bundles = await prisma.product.findMany({
      where: { kind: "BUNDLE" },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        reviews: { select: { rating: true } },
        bundleItems: bundleItemsInclude,
      },
      orderBy: { name: "asc" },
    });

    return bundles.map((bundle) => {
      const bundleItems = mapBundleComponents(bundle.bundleItems);
      return withRating({
        ...bundle,
        flavors: normalizeFlavorList(bundle.flavors),
        bundleItems,
        inStock: bundleInStock(bundle.inStock, bundleItems),
      });
    });
  } catch {
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        bundleItems: bundleItemsInclude,
      },
    });

    if (product) {
      return { product: hydrateProduct(product), fromDatabase: true as const };
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
        bundleItems: bundleItemsInclude,
      },
    });

    if (product) {
      return hydrateProduct(product);
    }
  } catch {
    // Fall through to seed data.
  }

  return fallbackProducts.find((product) => product.slug === slug) ?? null;
}

type PrismaProductWithBundle = {
  inStock: boolean;
  kind: "SIMPLE" | "BUNDLE";
  flavors: unknown;
  bundleItems: PrismaBundleItem[];
};

/** Normalise flavours and, for bundles, attach contents + effective stock. */
export function hydrateProduct<T extends PrismaProductWithBundle>(product: T) {
  const { bundleItems: rawItems, ...rest } = product;
  const isBundle = rest.kind === "BUNDLE";
  const bundleItems = isBundle ? mapBundleComponents(rawItems) : undefined;
  return {
    ...rest,
    flavors: normalizeFlavorList(rest.flavors),
    bundleItems,
    inStock:
      isBundle && bundleItems
        ? bundleInStock(rest.inStock, bundleItems)
        : rest.inStock,
  };
}
