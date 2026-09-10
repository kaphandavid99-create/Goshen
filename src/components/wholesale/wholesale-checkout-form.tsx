"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { WHOLESALE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import {
  useWholesaleCartStore,
  wholesaleCartSubtotalCents,
} from "@/stores/wholesale-cart-store";

type FieldErrors = Record<string, string[] | undefined>;

export function WholesaleCheckoutForm({
  defaultName,
  defaultPhone,
  momoAvailable,
}: {
  defaultName: string;
  defaultPhone: string;
  momoAvailable: boolean;
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const items = useWholesaleCartStore((state) => state.items);
  const clear = useWholesaleCartStore((state) => state.clear);
  const ready = useHasMounted();
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY",
  );
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOMO">("CASH");
  const [momoPhone, setMomoPhone] = useState(defaultPhone);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  if (!ready) {
    return <p className="mt-8 text-muted-foreground">{t.wholesale.loadingCheckout}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        {t.wholesale.cartEmpty}{" "}
        <Link href="/wholesale" className="text-primary underline">
          {t.wholesale.browseTheCatalog}
        </Link>
      </p>
    );
  }

  const subtotal = wholesaleCartSubtotalCents(items);
  const belowMin = subtotal < WHOLESALE.minOrderCents;
  const blocked = belowMin;
  const payWithMomo = momoAvailable && paymentMethod === "MOMO";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked) {
      return;
    }
    setPending(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);

    try {
      const csrfResponse = await fetch("/api/auth/csrf", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const csrfData = (await csrfResponse.json()) as { token?: string };

      const response = await fetch("/api/wholesale/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfData.token ?? "",
        },
        body: JSON.stringify({
          businessName: String(form.get("businessName") ?? ""),
          fulfillment,
          fullName: String(form.get("fullName") ?? ""),
          phone: String(form.get("phone") ?? ""),
          address: String(form.get("address") ?? ""),
          notes: String(form.get("notes") ?? ""),
          paymentMethod: payWithMomo ? "MOMO" : "CASH",
          momoPhone: payWithMomo ? momoPhone : "",
          items: items.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
        order?: { id: string };
        payment?: { id: string; method: string; status: string } | null;
      };

      if (response.status === 401) {
        router.push("/login?next=/wholesale/checkout");
        return;
      }

      if (!response.ok || !data.order) {
        setError(data.error ?? t.wholesale.unableToPlace);
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      clear();
      if (data.payment?.method === "MOMO") {
        router.push(`/pay/${data.payment.id}`);
      } else {
        router.push(`/account/orders/${data.order.id}`);
      }
      router.refresh();
    } catch {
      setError(t.wholesale.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
    >
      <div className="card space-y-5 p-6">
        <div className="space-y-2">
          <label htmlFor="businessName" className="block text-sm font-medium">
            {t.wholesale.businessName}
          </label>
          <input
            id="businessName"
            name="businessName"
            className="field"
            aria-invalid={fieldErrors.businessName ? true : undefined}
          />
          {fieldErrors.businessName?.[0] ? (
            <p className="text-sm text-accent">{fieldErrors.businessName[0]}</p>
          ) : null}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-primary">
            {t.wholesale.fulfillment}
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "DELIVERY"}
              onChange={() => setFulfillment("DELIVERY")}
            />
            {t.wholesale.deliveryOption}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "PICKUP"}
              onChange={() => setFulfillment("PICKUP")}
            />
            {t.wholesale.pickupOption}
          </label>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium">
            {t.wholesale.contactName}
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={defaultName}
            className="field"
          />
          {fieldErrors.fullName?.[0] ? (
            <p className="text-sm text-accent">{fieldErrors.fullName[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium">
            {t.wholesale.phone}
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={defaultPhone}
            className="field"
          />
          {fieldErrors.phone?.[0] ? (
            <p className="text-sm text-accent">{fieldErrors.phone[0]}</p>
          ) : null}
        </div>

        {fulfillment === "DELIVERY" ? (
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">
              {t.wholesale.deliveryAddress}
            </label>
            <input id="address" name="address" className="field" />
            {fieldErrors.address?.[0] ? (
              <p className="text-sm text-accent">{fieldErrors.address[0]}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium">
            {t.wholesale.notes}
          </label>
          <textarea id="notes" name="notes" rows={3} className="field" />
        </div>

        {momoAvailable ? (
          <fieldset className="space-y-3 border-t border-border pt-4">
            <legend className="text-sm font-semibold text-primary">
              {t.checkout.payment}
            </legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
              />
              {t.checkout.payCash}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "MOMO"}
                onChange={() => setPaymentMethod("MOMO")}
              />
              {t.checkout.payMomo}
            </label>
            {payWithMomo ? (
              <div className="space-y-2">
                <label htmlFor="momoPhone" className="block text-sm font-medium">
                  {t.checkout.momoNumber}
                </label>
                <input
                  id="momoPhone"
                  inputMode="tel"
                  value={momoPhone}
                  onChange={(event) => setMomoPhone(event.target.value)}
                  placeholder="2376XXXXXXXX"
                  aria-invalid={fieldErrors.momoPhone ? true : undefined}
                  className="field"
                />
                {fieldErrors.momoPhone?.[0] ? (
                  <p className="text-sm text-accent">
                    {fieldErrors.momoPhone[0]}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {t.checkout.momoHint}
                </p>
              </div>
            ) : null}
          </fieldset>
        ) : null}
      </div>

      <aside className="card h-fit space-y-4 p-6">
        <h2 className="font-semibold text-primary">{t.wholesale.orderSummary}</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.priceCents * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <p className="flex justify-between text-base font-bold text-primary">
            <span>{t.wholesale.subtotal}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t.wholesale.termsConfirmed}
          </p>
        </div>

        {belowMin ? (
          <p className="text-sm text-accent">
            {t.wholesale.minOrderNote(formatPrice(WHOLESALE.minOrderCents, locale))}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || blocked}
          className="btn btn-primary w-full disabled:opacity-55"
        >
          {pending
            ? t.wholesale.placingOrder
            : payWithMomo
              ? t.checkout.payAmountMomo(formatPrice(subtotal, locale))
              : t.wholesale.placeWholesaleOrder}
        </button>
      </aside>
    </form>
  );
}
