"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCart } from "@/components/icons";
import { useT } from "@/lib/i18n/context";
import { useCartStore } from "@/stores/cart-store";
import type { CatalogProduct } from "@/types/catalog";

export function AddToCartButton({
  product,
  className,
  variant = "button",
}: {
  product: CatalogProduct;
  className?: string;
  variant?: "button" | "compact";
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const t = useT();

  // Drinks with flavours need the picker on the product page.
  if (product.flavors.length > 0) {
    const cls =
      className ??
      (variant === "compact" ? "product-card-add" : "btn btn-primary w-full");
    return (
      <Link
        href={`/shop/${product.slug}`}
        className={cls}
        aria-label={t.shop.chooseFlavours}
      >
        <IconCart className="size-4" />
        {variant === "button" ? t.shop.chooseFlavours : t.shop.choose}
      </Link>
    );
  }

  function add() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      unit: product.unit,
      imageUrl: product.images[0]?.url,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  const label = !product.inStock
    ? t.common.outOfStock
    : added
      ? t.common.added
      : t.common.addToCart;

  return (
    <button
      type="button"
      onClick={add}
      disabled={!product.inStock}
      aria-label={label}
      className={
        className ?? (variant === "compact" ? "product-card-add" : "btn btn-primary w-full")
      }
    >
      <IconCart className="size-4" />
      {variant === "button"
        ? label
        : product.inStock
          ? added
            ? t.common.added
            : t.shop.add
          : null}
    </button>
  );
}
