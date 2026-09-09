import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { FlavorPicker } from "@/components/shop/flavor-picker";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { ProductReviews } from "@/components/shop/product-reviews";
import { primaryMedia, ProductMedia } from "@/components/shop/product-media";
import { DRINKS_CATEGORY_SLUG } from "@/lib/constants";
import { getDict, getI18n } from "@/lib/i18n/server";
import { dealCompareAt, formatPrice } from "@/lib/money";
import { isInWishlist } from "@/server/account/hub";
import { getCurrentUser } from "@/server/auth/current-user";
import { getProductBySlug } from "@/server/catalog/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [product, t] = await Promise.all([getProductBySlug(slug), getDict()]);

  return {
    title: product?.name ?? t.shop.productFallbackTitle,
    description: product?.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, { locale, t }] = await Promise.all([
    getProductBySlug(slug),
    getI18n(),
  ]);

  if (!product) {
    notFound();
  }

  const image = primaryMedia(product.images);
  const compareAt = dealCompareAt(product.priceCents, product.featured);
  const drinkFlavors =
    product.category.slug === DRINKS_CATEGORY_SLUG ? product.flavors : [];
  const user = await getCurrentUser();
  const saved = user
    ? await isInWishlist(user.id, product.id).catch(() => false)
    : false;

  return (
    <main className="page-wrap grid flex-1 gap-12 py-12 lg:grid-cols-2">
      <div className="space-y-3">
        <Reveal className="card relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <ProductMedia
              media={image}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          ) : null}
        </Reveal>
        {product.images.length > 1 ? (
          <ul className="grid grid-cols-4 gap-2">
            {product.images.slice(0, 4).map((item) => (
              <li key={item.url + item.sortOrder} className="card relative aspect-square overflow-hidden bg-muted">
                <ProductMedia media={item} sizes="20vw" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Reveal className="flex flex-col justify-center" delay={0.08}>
        <p className="kicker">
          <Link href={`/shop?category=${product.category.slug}`} className="hover:underline">
            {product.category.name}
          </Link>
        </p>
        <h1 className="page-title mt-2">
          {product.name}
        </h1>
        <p className="mt-4 flex items-baseline gap-3 text-2xl font-bold text-primary">
          {formatPrice(product.priceCents, locale)}
          {compareAt ? (
            <span className="text-base font-medium text-muted-foreground line-through">
              {formatPrice(compareAt, locale)}
            </span>
          ) : null}
          <span className="text-sm font-medium text-muted-foreground">/ {product.unit}</span>
        </p>
        {product.wholesalePriceCents ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {t.shop.wholesaleLabel}{" "}
            <span className="font-semibold text-primary">
              {formatPrice(product.wholesalePriceCents, locale)}
            </span>{" "}
            / {product.unit} —{" "}
            <Link href="/wholesale" className="underline">
              {t.shop.forApprovedBuyers}
            </Link>
          </p>
        ) : null}
        <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-8 max-w-xs space-y-3">
          {drinkFlavors.length > 0 ? (
            <FlavorPicker product={product} flavors={drinkFlavors} />
          ) : (
            <AddToCartButton product={product} />
          )}
          <WishlistButton
            productId={product.id}
            saved={saved}
            loginHref={`/login?next=/shop/${product.slug}`}
          />
        </div>
        <p className="mt-6 text-sm">
          <Link href="/shop" className="btn-ghost">
            {t.shop.backToShop}
          </Link>
        </p>
      </Reveal>
      <div className="lg:col-span-2">
        <ProductReviews productId={product.id} />
      </div>
    </main>
  );
}
