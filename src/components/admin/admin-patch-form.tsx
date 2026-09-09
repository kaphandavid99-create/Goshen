"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";

export function ProductFlagButton({
  productId,
  field,
  value,
  children,
}: {
  productId: string;
  field: "inStock" | "featured";
  value: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ [field]: !value }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-primary hover:border-primary"
    >
      {pending ? "…" : children}
    </button>
  );
}
