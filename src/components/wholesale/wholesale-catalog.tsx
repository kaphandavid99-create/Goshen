import Image from "next/image";
import Link from "next/link";
import { AddToWholesaleCart } from "@/components/wholesale/add-to-wholesale-cart";
import { primaryMedia } from "@/components/shop/product-media";
import { getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import type { WholesaleCatalogProduct } from "@/server/wholesale/queries";

export async function WholesaleCatalog({
  products,
}: {
  products: WholesaleCatalogProduct[];
}) {
  const { locale, t } = await getI18n();

  if (products.length === 0) {
    return (
      <p className="mt-10 text-muted-foreground">{t.wholesale.catalogEmpty}</p>
    );
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const image = primaryMedia(product.images);
        const wholesaleCents = product.wholesalePriceCents ?? 0;

        return (
          <article key={product.id} className="card flex flex-col p-4">
            <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-muted">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 100vw"
                  className="object-contain p-3"
                />
              ) : null}
            </div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.category.name}
            </p>
            <h2 className="mt-1 font-semibold text-primary">
              <Link href={`/wholesale/${product.slug}`} className="hover:underline">
                {product.name}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground">{product.unit}</p>

            <div className="mt-3 border-t border-border pt-3 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">{t.wholesale.retail}</span>
                <span>{formatPrice(product.priceCents, locale)}</span>
              </p>
              <p className="mt-1 flex justify-between font-semibold text-primary">
                <span>{t.wholesale.wholesaleLabel}</span>
                <span>
                  {formatPrice(wholesaleCents, locale)} / {product.unit}
                </span>
              </p>
            </div>

            <div className="mt-3 border-t border-border pt-3">
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
          </article>
        );
      })}
    </div>
  );
}
