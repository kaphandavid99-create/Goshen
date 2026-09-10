"use client";

import Image from "next/image";
import Link from "next/link";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { FREE_DELIVERY_FROM, deliveryFeeFor } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import {
  cartSubtotalCents,
  useCartStore,
} from "@/stores/cart-store";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const setFlavorQuantity = useCartStore((state) => state.setFlavorQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const ready = useHasMounted();
  const { locale, t } = useI18n();

  if (!ready) {
    return <p className="mt-10 text-muted-foreground">{t.cart.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="mt-10 text-muted-foreground">
        {t.cart.empty}{" "}
        <Link href="/shop" className="text-foreground underline">
          {t.cart.continueShopping}
        </Link>
      </p>
    );
  }

  const subtotal = cartSubtotalCents(items);
  const delivery = deliveryFeeFor(subtotal);
  const remainingForFree = Math.max(0, FREE_DELIVERY_FROM - subtotal);

  return (
    <div className="mt-10 space-y-8">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.productId}
            className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link
                href={`/shop/${item.slug}`}
                className="font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatPrice(item.priceCents, locale)} · {item.unit}
              </p>

              {item.flavors ? (
                <ul className="mt-3 space-y-1.5">
                  {Object.entries(item.flavors).map(([flavor, qty]) => (
                    <li
                      key={flavor}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>{flavor}</span>
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={t.cart.removeOne(flavor)}
                          onClick={() =>
                            setFlavorQuantity(item.productId, flavor, qty - 1)
                          }
                          className="grid size-7 place-items-center rounded-md border border-border transition hover:bg-muted"
                        >
                          −
                        </button>
                        <span className="w-5 text-center tabular-nums">{qty}</span>
                        <button
                          type="button"
                          aria-label={t.cart.addOne(flavor)}
                          onClick={() =>
                            setFlavorQuantity(item.productId, flavor, qty + 1)
                          }
                          className="grid size-7 place-items-center rounded-md border border-border transition hover:bg-muted"
                        >
                          +
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {item.flavors ? (
                <span className="text-sm text-muted-foreground">
                  {t.cart.flavorTotal(item.quantity)}
                </span>
              ) : (
                <div
                  role="group"
                  aria-label={t.cart.quantityFor(item.name)}
                  className="inline-flex items-center rounded-lg border border-border bg-card"
                >
                  <button
                    type="button"
                    aria-label={t.cart.decreaseQty(item.name)}
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      setQuantity(item.productId, item.quantity - 1)
                    }
                    className="grid size-9 place-items-center rounded-l-lg text-lg leading-none text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>
                  <span
                    aria-live="polite"
                    className="w-9 text-center text-sm font-medium tabular-nums"
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={t.cart.increaseQty(item.name)}
                    onClick={() =>
                      setQuantity(item.productId, item.quantity + 1)
                    }
                    className="grid size-9 place-items-center rounded-r-lg text-lg leading-none text-foreground transition hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-sm underline underline-offset-4"
              >
                {t.cart.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-medium">
            {t.cart.subtotal} {formatPrice(subtotal, locale)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.cart.delivery}{" "}
            {delivery === 0 ? t.common.free : formatPrice(delivery, locale)}
            {delivery > 0
              ? t.cart.deliveryAddMore(formatPrice(remainingForFree, locale))
              : ""}
          </p>
        </div>
        <Link
          href="/checkout"
          className="btn btn-primary"
        >
          {t.cart.checkout}
        </Link>
      </div>
    </div>
  );
}
