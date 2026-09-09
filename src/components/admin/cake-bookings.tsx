"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import type { CakeBookingStatus } from "@/types/cakes";

const STATUSES: CakeBookingStatus[] = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

export type AdminCakeBooking = {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  email: string | null;
  occasion: string | null;
  flavor: string | null;
  servings: string | null;
  eventDate: Date | null;
  fulfillment: "DELIVERY" | "PICKUP";
  budgetCents: number | null;
  details: string;
  status: CakeBookingStatus;
  createdAt: Date;
  user: { name: string; email: string } | null;
};

export function CakeBookingList({ bookings }: { bookings: AdminCakeBooking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="card p-5 text-sm text-muted-foreground">
        No cake bookings yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </ul>
  );
}

function BookingCard({ booking }: { booking: AdminCakeBooking }) {
  const router = useRouter();
  const [status, setStatus] = useState<CakeBookingStatus>(booking.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: CakeBookingStatus) {
    const previous = status;
    setStatus(next);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cakes/bookings/${booking.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        setStatus(previous);
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not update.");
        return;
      }
      router.refresh();
    } catch {
      setStatus(previous);
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const whatsapp = `https://wa.me/${booking.phone.replace(/[^\d]/g, "")}`;

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{booking.reference}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <select
          value={status}
          disabled={busy}
          onChange={(event) =>
            void updateStatus(event.target.value as CakeBookingStatus)
          }
          className="field w-auto py-1.5 text-sm"
        >
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0) + option.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <Row label="Customer" value={booking.fullName} />
        <Row
          label="Phone"
          value={
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {booking.phone}
            </a>
          }
        />
        {booking.email ? <Row label="Email" value={booking.email} /> : null}
        {booking.user ? (
          <Row label="Account" value={booking.user.email} />
        ) : (
          <Row label="Account" value="Guest booking" />
        )}
        {booking.occasion ? <Row label="Occasion" value={booking.occasion} /> : null}
        {booking.flavor ? <Row label="Type" value={booking.flavor} /> : null}
        {booking.servings ? <Row label="Servings" value={booking.servings} /> : null}
        {booking.eventDate ? (
          <Row label="Needed by" value={formatDate(booking.eventDate)} />
        ) : null}
        <Row
          label="Collection"
          value={booking.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"}
        />
        {booking.budgetCents ? (
          <Row label="Budget" value={formatPrice(booking.budgetCents)} />
        ) : null}
      </div>

      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm text-foreground">
        {booking.details}
      </p>
      {error ? <p className="mt-2 text-xs text-accent">{error}</p> : null}
    </li>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium text-foreground">{value}</span>
    </p>
  );
}
