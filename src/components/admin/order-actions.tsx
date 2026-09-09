"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { canAdminSetStatus } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"CONFIRMED" | "CANCELLED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAccept = canAdminSetStatus(status, "CONFIRMED");
  const canCancel = canAdminSetStatus(status, "CANCELLED");

  if (!canAccept && !canCancel) {
    return (
      <p className="text-sm text-muted-foreground">
        {status === "RECEIVED"
          ? "The customer confirmed they received this order."
          : "No further status changes are available."}
      </p>
    );
  }

  async function update(next: "CONFIRMED" | "CANCELLED") {
    setPending(next);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to update order.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      {status === "PENDING" ? (
        <p className="text-sm text-muted-foreground">
          Confirm this order to start packing, or cancel if you cannot fulfil it.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Confirmed. Waiting for the customer to mark it as received.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {canAccept ? (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => void update("CONFIRMED")}
            className="btn btn-primary"
          >
            {pending === "CONFIRMED" ? "Confirming…" : "Confirm order"}
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => void update("CANCELLED")}
            className="btn btn-outline"
          >
            {pending === "CANCELLED" ? "Cancelling…" : "Cancel order"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
