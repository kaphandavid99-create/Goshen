import seedData from "@/server/catalog/seed-data.json";
import { normalizeFlavorList } from "@/lib/flavors";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductImage,
} from "@/types/catalog";

type SeedImage = Pick<CatalogProductImage, "url" | "alt" | "sortOrder">;

type SeedProduct = Omit<
  CatalogProduct,
  "category" | "images" | "flavors" | "wholesalePriceCents"
> & {
  images: SeedImage[];
  flavors?: unknown;
  wholesalePriceCents?: number | null;
};

const categories: CatalogCategory[] = seedData.categories.map((category) => ({
  ...category,
  description: category.description ?? null,
}));

const categoryById = new Map(categories.map((category) => [category.id, category]));

export const fallbackCategories = categories;

export const fallbackProducts: CatalogProduct[] = (
  seedData.products as SeedProduct[]
).map((product) => {
  const category = categoryById.get(product.categoryId);

  if (!category) {
    throw new Error(`Unknown category for product ${product.slug}`);
  }

  return {
    ...product,
    category,
    wholesalePriceCents: product.wholesalePriceCents ?? null,
    flavors: normalizeFlavorList(product.flavors),
    images: product.images.map((image) => ({
      ...image,
      cloudinaryPublicId: null,
    })),
  };
});
