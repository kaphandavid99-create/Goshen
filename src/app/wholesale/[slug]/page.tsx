import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { primaryMedia } from "@/components/shop/product-media";
import { AddToWholesaleCart } from "@/components/wholesale/add-to-wholesale-cart";
import { getDict, getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import { requireApprovedWholesale } from "@/server/wholesale/access";
import { getWholesaleProduct } from "@/server/wholesale/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, t] = await Promise.all([getWholesaleProduct(slug), getDict()]);
  return {
    title: product ? `${product.name} · ${t.meta.wholesale}` : t.meta.wholesale,
  };
}

export default async function WholesaleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireApprovedWholesale(`/wholesale/${slug}`);

  const [product, { locale, t }] = await Promise.all([
    getWholesaleProduct(slug),
    getI18n(),
  ]);
  if (!product) {
    notFound();
  }

  const image = primaryMedia(product.images);
  const wholesaleCents = product.wholesalePriceCents ?? 0;

  return (
    <main className="page-wrap grid flex-1 gap-12 py-12 lg:grid-cols-2">
      <div className="card relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain p-4"
          />
        ) : null}
      </div>

      <div className="flex flex-col justify-center">
        <p className="kicker">
          <Link href="/wholesale" className="hover:underline">
            {t.wholesale.wholesaleLabel}
          </Link>{" "}
          · {product.category.name}
        </p>
        <h1 className="page-title mt-2">{product.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.wholesale.retailPriceLine(
            formatPrice(product.priceCents, locale),
            product.unit,
          )}
        </p>
        <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
          {product.description}
        </p>

        <div className="card mt-8 max-w-sm space-y-4 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-primary">
              {t.wholesale.wholesalePrice}
            </h2>
            <p className="text-lg font-bold text-primary">
              {formatPrice(wholesaleCents, locale)}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                / {product.unit}
              </span>
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <AddToWholesaleCart
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                unit: product.unit,
                imageUrl: image?.url,
                priceCents: wholesaleCents,
              }}
            />
          </div>
        </div>

        <p className="mt-6 text-sm">
          <Link href="/wholesale" className="btn-ghost">
            {t.wholesale.backToCatalog}
          </Link>
        </p>
      </div>
    </main>
  );
}
