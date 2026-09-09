"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconHeart } from "@/components/icons";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";

export function WishlistButton({
  productId,
  saved,
  loginHref,
  variant = "button",
}: {
  productId: string;
  saved: boolean;
  loginHref: string;
  variant?: "button" | "icon";
}) {
  const router = useRouter();
  const [on, setOn] = useState(saved);
  const [pending, setPending] = useState(false);
  const t = useT();

  async function toggle(event?: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    setPending(true);
    try {
      const response = await fetch("/api/account/wishlist", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ productId }),
      });
      if (response.status === 401) {
        router.push(loginHref);
        return;
      }
      const data = (await response.json()) as { saved?: boolean };
      if (response.ok && typeof data.saved === "boolean") {
        setOn(data.saved);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={(event) => void toggle(event)}
        aria-pressed={on}
        aria-label={on ? t.shop.removeFromWishlist : t.shop.addToWishlist}
        className={`wishlist-heart ${on ? "is-saved" : ""}`}
      >
        <IconHeart className="size-4" fill={on ? "currentColor" : "none"} />
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void toggle()}
      className="btn btn-outline w-full"
    >
      <IconHeart className="size-4" fill={on ? "currentColor" : "none"} />
      {on ? t.shop.savedToWishlist : t.shop.saveToWishlist}
    </button>
  );
}
