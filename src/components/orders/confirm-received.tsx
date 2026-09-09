"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";

export function ConfirmReceived({ orderId }: { orderId: string }) {
  const router = useRouter();
  const t = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/receive`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "x-csrf-token": await readCsrf(),
        },
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? t.orders.confirm.error);
        return;
      }
      router.refresh();
    } catch {
      setError(t.orders.confirm.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card mt-6 p-6">
      <h2 className="section-title">{t.orders.confirm.title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t.orders.confirm.body}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void confirm()}
        className="btn btn-primary mt-5"
      >
        {pending ? t.orders.confirm.saving : t.orders.confirm.button}
      </button>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-accent">
          {error}
        </p>
      ) : null}
    </section>
  );
}
