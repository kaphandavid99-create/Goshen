"use client";

import Link from "next/link";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useT } from "@/lib/i18n/context";
import { cartCount, useCartStore } from "@/stores/cart-store";

export function CartLink() {
  const items = useCartStore((state) => state.items);
  const ready = useHasMounted();
  const count = ready ? cartCount(items) : 0;
  const t = useT();

  return (
    <Link
      href="/cart"
      className="text-foreground underline-offset-4 hover:underline"
    >
      {t.header.basket}
      {count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
