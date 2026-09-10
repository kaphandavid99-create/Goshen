"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck } from "@/components/icons";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";

type Status = "PENDING" | "SUCCEEDED" | "FAILED";

const POLL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes

export function PaymentTracker({
  paymentId,
  orderId,
  amountCents,
  phone,
  initialStatus,
  initialReason,
}: {
  paymentId: string;
  orderId: string;
  amountCents: number;
  phone: string | null;
  initialStatus: Status;
  initialReason: string | null;
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const p = t.pay;
  const [status, setStatus] = useState<Status>(initialStatus);
  const [reason, setReason] = useState<string | null>(initialReason);
  const [timedOut, setTimedOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const polls = useRef(0);

  const poll = useCallback(async () => {
    const response = await fetch(`/api/payments/${paymentId}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return;
    const data = (await response.json()) as {
      payment: { status: Status; failureReason: string | null };
    };
    setStatus(data.payment.status);
    setReason(data.payment.failureReason);
  }, [paymentId]);

  useEffect(() => {
    if (status !== "PENDING" || timedOut) {
      return;
    }
    const id = setInterval(() => {
      polls.current += 1;
      if (polls.current > MAX_POLLS) {
        setTimedOut(true);
        return;
      }
      poll().catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [status, timedOut, poll]);

  useEffect(() => {
    if (status === "SUCCEEDED") {
      const id = setTimeout(() => {
        router.push(`/account/orders/${orderId}`);
        router.refresh();
      }, 1800);
      return () => clearTimeout(id);
    }
  }, [status, orderId, router]);

  async function act(action: "retry" | "cancel") {
    setBusy(true);
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setReason(data.error ?? p.error);
        return;
      }
      if (action === "cancel") {
        router.push("/shop");
        router.refresh();
        return;
      }
      polls.current = 0;
      setTimedOut(false);
      setReason(null);
      setStatus("PENDING");
    } catch {
      setReason(p.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-6 space-y-4 p-6">
      <p className="text-sm text-muted-foreground">
        {p.amount}{" "}
        <span className="font-semibold text-primary">
          {formatPrice(amountCents, locale)}
        </span>
        {phone ? ` · ${phone}` : ""}
      </p>

      {status === "PENDING" && !timedOut ? (
        <div className="space-y-3">
          <p className="font-semibold text-primary">{p.checkPhone}</p>
          <p className="text-sm text-muted-foreground">{p.checkPhoneHint}</p>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      ) : null}

      {status === "PENDING" && timedOut ? (
        <div className="space-y-3">
          <p className="font-semibold text-primary">{p.stillPending}</p>
          <p className="text-sm text-muted-foreground">{p.stillPendingHint}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTimedOut(false);
                polls.current = 0;
              }}
              className="btn btn-outline"
            >
              {p.keepWaiting}
            </button>
            <Link
              href={`/account/orders/${orderId}`}
              className="btn-ghost text-sm"
            >
              {p.goToOrder}
            </Link>
          </div>
        </div>
      ) : null}

      {status === "SUCCEEDED" ? (
        <p className="inline-flex items-center gap-2 font-semibold text-primary">
          <IconCheck className="size-5" />
          {p.paid}
        </p>
      ) : null}

      {status === "FAILED" ? (
        <div className="space-y-3">
          <p className="font-semibold text-red-600">{p.failed}</p>
          {reason ? (
            <p className="text-sm text-muted-foreground">{reason}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => act("retry")}
              disabled={busy}
              className="btn btn-rose disabled:opacity-60"
            >
              {p.tryAgain}
            </button>
            <button
              type="button"
              onClick={() => act("cancel")}
              disabled={busy}
              className="btn-ghost text-sm disabled:opacity-60"
            >
              {p.cancelOrder}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
