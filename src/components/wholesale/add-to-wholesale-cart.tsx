"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import { useWholesaleCartStore } from "@/stores/wholesale-cart-store";

export function AddToWholesaleCart({
  product,
}: {
  product: {
    productId: string;
    slug: string;
    name: string;
    unit: string;
    imageUrl?: string;
    priceCents: number;
  };
}) {
  const addItem = useWholesaleCartStore((state) => state.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { locale, t } = useI18n();

  function add() {
    if (qty < 1) return;
    addItem(
      {
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        imageUrl: product.imageUrl,
        priceCents: product.priceCents,
      },
      qty,
    );
    setAdded(true);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`wq-${product.productId}`}>
          {t.wholesale.quantityFor(product.name)}
        </label>
        <input
          id={`wq-${product.productId}`}
          type="number"
          min={1}
          value={qty}
          onChange={(event) => {
            setQty(Math.max(1, Math.floor(Number(event.target.value) || 0)));
            setAdded(false);
          }}
          className="field w-24 py-1.5"
        />
        <button type="button" onClick={add} className="btn btn-primary">
          {t.wholesale.add}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {t.wholesale.lineTotal(
          formatPrice(product.priceCents, locale),
          product.unit,
          formatPrice(product.priceCents * qty, locale),
        )}
      </p>

      {added ? (
        <p className="text-xs text-primary">
          {t.wholesale.added}{" "}
          <Link href="/wholesale/cart" className="underline">
            {t.wholesale.viewCartShort}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
