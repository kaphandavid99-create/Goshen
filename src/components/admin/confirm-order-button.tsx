"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { canAdminSetStatus } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export function ConfirmOrderButton({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canAdminSetStatus(status, "CONFIRMED")) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to confirm order.");
        return;
      }
      router.refresh();
    } catch {
      setError("Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => void confirm()}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-92 disabled:opacity-55"
      >
        {pending ? "Confirming…" : "Confirm"}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
