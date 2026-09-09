"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { dealCompareAt, formatPrice } from "@/lib/money";
import type { CatalogProduct } from "@/types/catalog";
import { IconStar } from "@/components/icons";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { primaryMedia, ProductMedia } from "@/components/shop/product-media";

export function ProductCard({
  product,
  saved = false,
}: {
  product: CatalogProduct;
  saved?: boolean;
}) {
  const image = primaryMedia(product.images);
  const compareAt = dealCompareAt(product.priceCents, product.featured);
  const rating = typeof product.rating === "number" ? product.rating : null;
  const reduce = useReducedMotion();
  const { locale, t } = useI18n();

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="product-card-stage">
        <Link href={`/shop/${product.slug}`} className="product-card-stage-link">
          {image ? (
            <ProductMedia
              media={image}
              sizes="(min-width: 1024px) 20vw, (min-width: 480px) 45vw, 100vw"
              className="object-contain"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
              {product.name}
            </span>
          )}
        </Link>
        <WishlistButton
          productId={product.id}
          saved={saved}
          loginHref={`/login?next=/shop/${product.slug}`}
          variant="icon"
        />
        {!product.inStock ? (
          <div className="product-card-sold">
            <span>{t.common.outOfStock}</span>
          </div>
        ) : null}
      </div>
      <div className="product-card-label">
        <div className="product-card-meta">
          <span className="product-card-category">{product.category.name}</span>
          {rating ? (
            <span className="product-card-rating">
              <IconStar className="size-3.5" fill="currentColor" stroke="none" />
              {rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <h2 className="product-card-title">
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </h2>
        <p className="product-card-unit">{product.unit}</p>
        <div className="product-card-row">
          <p className="product-card-price">
            <span className="product-card-price-now">
              {formatPrice(product.priceCents, locale)}
            </span>
            {compareAt ? (
              <span className="product-card-price-was">
                {formatPrice(compareAt, locale)}
              </span>
            ) : null}
          </p>
          <AddToCartButton product={product} variant="compact" />
        </div>
      </div>
    </motion.article>
  );
}
