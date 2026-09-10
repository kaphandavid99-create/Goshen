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

export type BundleComponent = {
  productId: string;
  name: string;
  slug: string;
  unit: string;
  quantity: number;
  imageUrl: string | null;
  inStock: boolean;
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
  /**
   * For bundles this is the *effective* stock: false when the bundle itself is
   * off, or when any product inside it is out of stock.
   */
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  category: CatalogCategory;
  images: CatalogProductImage[];
  /** Drink flavours a shopper can pick from; empty for everything else. */
  flavors: string[];
  /** "SIMPLE" for normal products, "BUNDLE" for admin-assembled sets. */
  kind: "SIMPLE" | "BUNDLE";
  /** Present only on bundles: the products it contains, in display order. */
  bundleItems?: BundleComponent[];
  rating?: number | null;
  reviewCount?: number;
};
