import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { BUNDLES_CATEGORY_SLUG } from "@/lib/constants";
import { isCloudinaryConfigured } from "@/lib/env";
import { listAdminSimpleProducts } from "@/server/admin/queries";
import { listCategories } from "@/server/catalog/queries";

export const metadata: Metadata = {
  title: "New product",
};

export default async function NewProductPage() {
  const [categories, allProducts] = await Promise.all([
    listCategories(),
    listAdminSimpleProducts(),
  ]);
  const bundlesCategoryId = categories.find(
    (category) => category.slug === BUNDLES_CATEGORY_SLUG,
  )?.id;

  return (
    <main>
      <Link href="/admin/products" className="btn-ghost text-sm">
        Back to products
      </Link>
      <p className="kicker mt-4">Catalog</p>
      <h1 className="page-title mt-1">New product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add the photos first, then the details and category — or make a bundle of
        existing products. You can add more photos and videos afterwards.
      </p>

      <section className="card mt-8 p-5 sm:p-6">
        <ProductForm
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }))}
          allProducts={allProducts}
          bundlesCategoryId={bundlesCategoryId}
          cloudinaryConfigured={isCloudinaryConfigured()}
        />
      </section>
    </main>
  );
}
