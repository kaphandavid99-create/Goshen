import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteMediaButton, MediaUploader } from "@/components/admin/media-uploader";
import { DeleteProductButton, ProductForm } from "@/components/admin/product-form";
import { BUNDLES_CATEGORY_SLUG } from "@/lib/constants";
import { isCloudinaryConfigured } from "@/lib/env";
import { normalizeFlavorList } from "@/lib/flavors";
import { formatPrice } from "@/lib/money";
import { getAdminProduct, listAdminSimpleProducts } from "@/server/admin/queries";
import { listCategories } from "@/server/catalog/queries";

export const metadata: Metadata = {
  title: "Edit product",
};

export default async function AdminProductMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, allProducts] = await Promise.all([
    getAdminProduct(id),
    listCategories(),
    listAdminSimpleProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const configured = isCloudinaryConfigured();
  const bundlesCategoryId = categories.find(
    (category) => category.slug === BUNDLES_CATEGORY_SLUG,
  )?.id;

  return (
    <main>
      <Link href="/admin/products" className="btn-ghost text-sm">
        Back to products
      </Link>
      <p className="kicker mt-4">Catalog</p>
      <h1 className="page-title mt-1">{product.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {product.category.name} · {formatPrice(product.priceCents)} / {product.unit}
      </p>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="section-title">Upload</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Images go to Cloudinary and the background is removed automatically.
          Videos are stored as uploaded.
        </p>
        {configured ? (
          <MediaUploader productId={product.id} />
        ) : (
          <p className="text-sm text-accent">
            Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and
            CLOUDINARY_API_SECRET to .env, then restart the app.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="section-title">Library</h2>
        {product.images.length === 0 ? (
          <p className="card mt-4 p-5 text-sm text-muted-foreground">
            No Cloudinary files on this product yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {product.images.map((item) => (
              <li key={item.id} className="card overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  {item.resourceType === "video" ? (
                    <video
                      src={item.url}
                      className="size-full object-contain"
                      controls
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1280px) 20vw, 45vw"
                      className="object-contain p-4"
                    />
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <p className="text-sm font-medium text-primary">{item.alt}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.resourceType === "video" ? "Video" : "Image · background removed"}
                  </p>
                  <DeleteMediaButton productId={product.id} mediaId={item.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="section-title">Details</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Update the name, price, unit, description, or category.
        </p>
        <ProductForm
          productId={product.id}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }))}
          allProducts={allProducts}
          bundlesCategoryId={bundlesCategoryId}
          initial={{
            name: product.name,
            description: product.description,
            priceCents: product.priceCents,
            unit: product.unit,
            categoryId: product.categoryId,
            inStock: product.inStock,
            featured: product.featured,
            wholesalePriceCents: product.wholesalePriceCents,
            flavors: normalizeFlavorList(product.flavors),
            kind: product.kind,
            bundleItems: product.bundleItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }}
        />
      </section>

      <section className="card mt-8 border-accent/30 p-5 sm:p-6">
        <h2 className="section-title">Danger zone</h2>
        <p className="mt-2 mb-4 text-sm text-muted-foreground">
          Removing this product also deletes its photos, reviews, and wishlist
          entries. Past orders keep their line items.
        </p>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </section>
    </main>
  );
}
