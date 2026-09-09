"use client";

import { useEffect, useRef, useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { NIPZ } from "@/lib/constants";
import { useT } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { onBookingRequest } from "@/app/shop/nipz/booking-bus";

type FieldErrors = Record<string, string[] | undefined>;
type NipzForm = Dictionary["nipz"]["form"];

const INITIAL = {
  fullName: "",
  phone: "",
  email: "",
  occasion: "",
  flavor: "",
  servings: "",
  eventDate: "",
  fulfillment: "PICKUP" as "PICKUP" | "DELIVERY",
  budget: "",
  details: "",
};

function buildWhatsappText(
  values: typeof INITIAL,
  wa: NipzForm["wa"],
  reference?: string,
) {
  const lines = [
    wa.intro(NIPZ.shortName),
    reference ? wa.reference(reference) : null,
    wa.name(values.fullName),
    wa.phone(values.phone),
    values.occasion ? wa.occasion(values.occasion) : null,
    values.flavor ? wa.flavor(values.flavor) : null,
    values.servings ? wa.servings(values.servings) : null,
    values.eventDate ? wa.neededBy(values.eventDate) : null,
    wa.collection(values.fulfillment === "DELIVERY" ? wa.delivery : wa.pickup),
    values.budget ? wa.budget(values.budget) : null,
    values.details ? wa.details(values.details) : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function BookingForm() {
  const t = useT();
  const f = t.nipz.form;
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return onBookingRequest((itemName) => {
      setValues((current) => {
        const prefix = f.wa.orderItem(itemName);
        const details = current.details.includes(prefix)
          ? current.details
          : `${prefix}${current.details ? ` ${current.details}` : " "}`;
        return { ...current, details };
      });
      window.setTimeout(() => {
        detailsRef.current?.focus();
        const end = detailsRef.current?.value.length ?? 0;
        detailsRef.current?.setSelectionRange(end, end);
      }, 320);
    });
  }, [f]);

  function set<K extends keyof typeof INITIAL>(key: K, value: (typeof INITIAL)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const whatsappHref = `${NIPZ.whatsappHref}?text=${encodeURIComponent(
    buildWhatsappText(values, f.wa, reference ?? undefined),
  )}`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);

    const payload = {
      fullName: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      occasion: values.occasion || undefined,
      flavor: values.flavor || undefined,
      servings: values.servings || undefined,
      eventDate: values.eventDate || undefined,
      fulfillment: values.fulfillment,
      budget: values.budget ? Number(values.budget.replace(/[^\d]/g, "")) : undefined,
      details: values.details,
    };

    try {
      const response = await fetch("/api/cakes/bookings", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
        booking?: { reference: string };
      };

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        setMessage(data.error ?? f.couldNotSend);
        return;
      }

      const ref = data.booking?.reference ?? undefined;
      setReference(ref ?? null);
      setMessage(f.received);

      // Hand the booking to the bakery's WhatsApp with everything prefilled.
      const href = `${NIPZ.whatsappHref}?text=${encodeURIComponent(
        buildWhatsappText(values, f.wa, ref),
      )}`;
      window.open(href, "_blank", "noopener,noreferrer");
    } catch {
      setMessage(f.networkError);
    } finally {
      setPending(false);
    }
  }

  if (reference) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">
          {f.referenceLabel(reference)}
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">{f.whatsappDidntOpen}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-rose"
          >
            {f.sendOnWhatsapp}
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setValues(INITIAL);
              setReference(null);
              setMessage(null);
            }}
          >
            {f.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.yourName} error={errors.fullName}>
          <input
            className="field"
            value={values.fullName}
            onChange={(event) => set("fullName", event.target.value)}
            required
            maxLength={80}
          />
        </Field>
        <Field label={f.phone} error={errors.phone}>
          <input
            className="field"
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
            required
            inputMode="tel"
            maxLength={20}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.email} error={errors.email}>
          <input
            className="field"
            type="email"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
            maxLength={120}
          />
        </Field>
        <Field label={f.occasion} error={errors.occasion}>
          <select
            className="field"
            value={values.occasion}
            onChange={(event) => set("occasion", event.target.value)}
          >
            <option value="">{f.choose}</option>
            {NIPZ.occasions.map((occasion) => (
              <option key={occasion} value={occasion}>
                {t.nipz.occasions[occasion] ?? occasion}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.cakeType} error={errors.flavor}>
          <input
            className="field"
            value={values.flavor}
            onChange={(event) => set("flavor", event.target.value)}
            placeholder={f.cakeTypePlaceholder}
            maxLength={120}
          />
        </Field>
        <Field label={f.servings} error={errors.servings}>
          <input
            className="field"
            value={values.servings}
            onChange={(event) => set("servings", event.target.value)}
            placeholder={f.servingsPlaceholder}
            maxLength={40}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={f.neededBy}
          error={errors.eventDate}
          hint={f.neededByHint(NIPZ.bookingLeadDays)}
        >
          <input
            className="field"
            type="date"
            value={values.eventDate}
            onChange={(event) => set("eventDate", event.target.value)}
          />
        </Field>
        <Field label={f.budget} error={errors.budget}>
          <input
            className="field"
            inputMode="numeric"
            value={values.budget}
            onChange={(event) => set("budget", event.target.value)}
            placeholder={f.budgetPlaceholder}
            maxLength={12}
          />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{f.collection}</legend>
        <div className="flex gap-2">
          {(["PICKUP", "DELIVERY"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => set("fulfillment", option)}
              className={
                values.fulfillment === option
                  ? "nipz-filter is-active"
                  : "nipz-filter"
              }
            >
              {option === "PICKUP" ? f.pickupAtShop : f.deliveryInBamenda}
            </button>
          ))}
        </div>
      </fieldset>

      <Field label={f.tellUs} error={errors.details}>
        <textarea
          ref={detailsRef}
          className="field min-h-28"
          value={values.details}
          onChange={(event) => set("details", event.target.value)}
          required
          maxLength={1200}
          placeholder={f.tellUsPlaceholder}
        />
      </Field>

      {message ? (
        <p role="alert" className="text-sm text-accent">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-rose">
          {pending ? f.sending : f.requestBooking}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          {f.sendOnWhatsappInstead}
        </a>
      </div>
      <p className="text-xs text-muted-foreground">{f.noPaymentNow}</p>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && !error ? (
        <span className="block text-xs text-muted-foreground">{hint}</span>
      ) : null}
      {error?.[0] ? (
        <span className="block text-xs text-accent">{error[0]}</span>
      ) : null}
    </label>
  );
}
