"use client";

import { useState } from "react";
import { IconCart } from "@/components/icons";
import { useT } from "@/lib/i18n/context";
import { useCartStore } from "@/stores/cart-store";
import type { CatalogProduct } from "@/types/catalog";

export function FlavorPicker({
  product,
  flavors,
}: {
  product: CatalogProduct;
  flavors: string[];
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const t = useT();

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const soldOut = !product.inStock;

  function bump(flavor: string, delta: number) {
    setCounts((current) => {
      const next = Math.max(0, (current[flavor] ?? 0) + delta);
      const copy = { ...current };
      if (next === 0) delete copy[flavor];
      else copy[flavor] = next;
      return copy;
    });
  }

  function add() {
    if (total < 1 || soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      unit: product.unit,
      imageUrl: product.images[0]?.url,
      flavors: counts,
    });
    setCounts({});
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary">{t.shop.chooseFlavours}</p>
        <p className="text-xs text-muted-foreground">{t.shop.chooseFlavoursHint}</p>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {flavors.map((flavor) => {
          const count = counts[flavor] ?? 0;
          return (
            <li
              key={flavor}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <span className="text-sm font-medium">{flavor}</span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t.cart.removeOne(flavor)}
                  onClick={() => bump(flavor, -1)}
                  disabled={count === 0}
                  className="grid size-7 place-items-center rounded-md border border-border text-primary transition hover:bg-muted disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">
                  {count}
                </span>
                <button
                  type="button"
                  aria-label={t.cart.addOne(flavor)}
                  onClick={() => bump(flavor, 1)}
                  className="grid size-7 place-items-center rounded-md border border-border text-primary transition hover:bg-muted"
                >
                  +
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={add}
        disabled={soldOut || total < 1}
        className="btn btn-primary w-full"
      >
        <IconCart className="size-4" />
        {soldOut
          ? t.common.outOfStock
          : added
            ? t.common.added
            : total > 0
              ? t.shop.addN(total)
              : t.common.addToCart}
      </button>
    </div>
  );
}
