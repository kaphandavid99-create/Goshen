export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type CatalogProductImage = {
  url: string;
  alt: string;
  cloudinaryPublicId?: string | null;
  resourceType?: "image" | "video" | string;
  sortOrder: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  /** Optional flat wholesale unit price; null when not sold wholesale. */
  wholesalePriceCents: number | null;
  unit: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  category: CatalogCategory;
  images: CatalogProductImage[];
  /** Drink flavours a shopper can pick from; empty for everything else. */
  flavors: string[];
  rating?: number | null;
  reviewCount?: number;
};
