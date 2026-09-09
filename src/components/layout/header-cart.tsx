"use client";

import Link from "next/link";
import { IconCart } from "@/components/icons";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import { cartCount, cartSubtotalCents, useCartStore } from "@/stores/cart-store";

export function HeaderCart() {
  const items = useCartStore((state) => state.items);
  const ready = useHasMounted();
  const count = ready ? cartCount(items) : 0;
  const total = ready ? cartSubtotalCents(items) : 0;
  const { locale, t } = useI18n();

  return (
    <Link
      href="/cart"
      aria-label={t.cart.open}
      className="relative flex items-center gap-2"
    >
      <span className="relative text-primary">
        <IconCart className="size-6" />
        {count > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-right leading-tight sm:block">
        <span className="block text-[11px] text-muted-foreground">
          {t.header.cartLabel}
        </span>
        <span className="text-xs font-semibold text-primary">
          {formatPrice(total, locale)}
        </span>
      </span>
    </Link>
  );
}
