import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/server/catalog/queries";

export const metadata: Metadata = {
  title: "New product",
};

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <main>
      <Link href="/admin/products" className="btn-ghost text-sm">
        Back to products
      </Link>
      <p className="kicker mt-4">Catalog</p>
      <h1 className="page-title mt-1">New product</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the details and pick a category. After you create it, you can
        upload photos and videos.
      </p>

      <section className="card mt-8 p-5 sm:p-6">
        <ProductForm
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }))}
        />
      </section>
    </main>
  );
}
