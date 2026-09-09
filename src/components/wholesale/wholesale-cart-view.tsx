"use client";

import Image from "next/image";
import Link from "next/link";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { WHOLESALE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import {
  useWholesaleCartStore,
  wholesaleCartSubtotalCents,
} from "@/stores/wholesale-cart-store";

export function WholesaleCartView() {
  const items = useWholesaleCartStore((state) => state.items);
  const setQuantity = useWholesaleCartStore((state) => state.setQuantity);
  const removeItem = useWholesaleCartStore((state) => state.removeItem);
  const ready = useHasMounted();
  const { locale, t } = useI18n();

  if (!ready) {
    return <p className="mt-10 text-muted-foreground">{t.wholesale.loadingCart}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="mt-10 text-muted-foreground">
        {t.wholesale.cartEmpty}{" "}
        <Link href="/wholesale" className="text-foreground underline">
          {t.wholesale.browseCatalog}
        </Link>
      </p>
    );
  }

  const subtotal = wholesaleCartSubtotalCents(items);
  const belowMin = subtotal < WHOLESALE.minOrderCents;
  const blocked = belowMin;

  return (
    <div className="mt-10 space-y-8">
      <ul className="space-y-4">
        {items.map((item) => {
          const unit = item.priceCents;
          return (
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
                  href={`/wholesale/${item.slug}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(unit, locale)} / {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`wcq-${item.productId}`}>
                  {t.wholesale.quantityFor(item.name)}
                </label>
                <input
                  id={`wcq-${item.productId}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    setQuantity(
                      item.productId,
                      Math.max(0, Math.floor(Number(event.target.value) || 0)),
                    )
                  }
                  className="field w-20 py-1.5"
                />
                <span className="w-28 text-right text-sm font-medium">
                  {formatPrice(unit * item.quantity, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm underline underline-offset-4"
                >
                  {t.wholesale.remove}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-medium">
            {t.wholesale.subtotal} {formatPrice(subtotal, locale)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.wholesale.deliveryArranged}
          </p>
          {belowMin ? (
            <p className="text-sm text-accent">
              {t.wholesale.minOrderNote(
                formatPrice(WHOLESALE.minOrderCents, locale),
              )}
            </p>
          ) : null}
        </div>
        {blocked ? (
          <span className="btn btn-primary pointer-events-none opacity-55">
            {t.wholesale.checkout}
          </span>
        ) : (
          <Link href="/wholesale/checkout" className="btn btn-primary">
            {t.wholesale.checkout}
          </Link>
        )}
      </div>
    </div>
  );
}
