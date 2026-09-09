import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductFlagButton } from "@/components/admin/admin-patch-form";
import { ClearAllImagesButton } from "@/components/admin/media-uploader";
import { formatPrice } from "@/lib/money";
import { listAdminCategories, listAdminProducts } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    listAdminProducts(),
    listAdminCategories(),
  ]);

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Catalog</p>
          <h1 className="page-title mt-1">Products</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Add a product with its details and category, then open it to upload
            photos. Image backgrounds are removed on upload.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary shrink-0">
          New product
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category.id}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
          >
            {category.name}
            <span className="ml-1.5 font-semibold text-primary">
              {category._count.products}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-6">
        <ClearAllImagesButton />
      </div>

      <section className="card mt-6 overflow-hidden">
        {products.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No products in the database yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Deal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const image = product.images[0];
                  return (
                    <tr key={product.id}>
                      <td>
                        <span className="flex items-center gap-3">
                          <span className="relative size-11 overflow-hidden rounded-lg bg-muted">
                            {image && image.resourceType !== "video" ? (
                              <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                sizes="44px"
                                className="object-contain p-1"
                              />
                            ) : image?.resourceType === "video" ? (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                                Video
                              </span>
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center text-center text-[9px] font-semibold text-accent">
                                No photo
                              </span>
                            )}
                          </span>
                          <span>
                            <span className="block font-semibold text-primary">
                              {product.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {product.unit}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td>{product.category.name}</td>
                      <td className="font-medium">{formatPrice(product.priceCents)}</td>
                      <td>{product.inStock ? "In stock" : "Out of stock"}</td>
                      <td>{product.featured ? "Featured" : "—"}</td>
                      <td>
                        <span className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-primary hover:border-primary"
                          >
                            Edit &amp; media
                          </Link>
                          <ProductFlagButton
                            productId={product.id}
                            field="inStock"
                            value={product.inStock}
                          >
                            {product.inStock ? "Mark out" : "Mark in"}
                          </ProductFlagButton>
                          <ProductFlagButton
                            productId={product.id}
                            field="featured"
                            value={product.featured}
                          >
                            {product.featured ? "Remove deal" : "Make deal"}
                          </ProductFlagButton>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
