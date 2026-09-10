"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { DELIVERY_FEE, FREE_DELIVERY_FROM, deliveryFeeFor } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import {
  canRedeemPoints,
  redeemableDiscount,
  spendPointsFor,
} from "@/lib/points";
import { cartSubtotalCents, useCartStore } from "@/stores/cart-store";

type FieldErrors = Record<string, string[] | undefined>;

export function CheckoutForm({
  defaultName,
  defaultPhone,
  points,
  addresses,
  momoAvailable,
}: {
  defaultName: string;
  defaultPhone: string;
  points: number;
  addresses: {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    line: string;
    isDefault: boolean;
  }[];
  momoAvailable: boolean;
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const ready = useHasMounted();
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? "");
  const selectedAddress =
    addresses.find((item) => item.id === selectedAddressId) ?? defaultAddress;
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOMO">("CASH");
  const [momoPhone, setMomoPhone] = useState(defaultPhone);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  if (!ready) {
    return <p className="mt-8 text-muted-foreground">{t.checkout.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground">
        {t.checkout.emptyCart}{" "}
        <Link href="/shop" className="text-primary underline">
          {t.checkout.continueShopping}
        </Link>
      </p>
    );
  }

  const payWithMomo = momoAvailable && paymentMethod === "MOMO";
  const subtotal = cartSubtotalCents(items);
  const delivery = fulfillment === "DELIVERY" ? deliveryFeeFor(subtotal) : 0;
  const canRedeem = canRedeemPoints(points, subtotal) && !payWithMomo;
  const discount =
    redeemPoints && canRedeem ? redeemableDiscount(points, subtotal) : 0;
  const total = subtotal - discount + delivery;
  const earnedPoints = spendPointsFor(total);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfData.token ?? "",
        },
        body: JSON.stringify({
          fulfillment,
          fullName: String(form.get("fullName") ?? ""),
          phone: String(form.get("phone") ?? ""),
          address: String(form.get("address") ?? ""),
          notes: String(form.get("notes") ?? ""),
          redeemPoints: redeemPoints && canRedeem,
          paymentMethod: payWithMomo ? "MOMO" : "CASH",
          momoPhone: payWithMomo ? momoPhone : "",
          items: items.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            quantity: item.quantity,
            ...(item.flavors ? { flavors: item.flavors } : {}),
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
        router.push("/login?next=/checkout");
        return;
      }

      if (!response.ok || !data.order) {
        setError(data.error ?? t.checkout.unableToPlace);
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
      setError(t.checkout.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="card space-y-5 p-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-primary">
            {t.checkout.fulfillment}
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "DELIVERY"}
              onChange={() => setFulfillment("DELIVERY")}
            />
            {t.checkout.deliveryInBamenda}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "PICKUP"}
              onChange={() => setFulfillment("PICKUP")}
            />
            {t.checkout.pickupAtNewBell}
          </label>
        </fieldset>
        <Field
          key={`name-${selectedAddressId}`}
          id="fullName"
          name="fullName"
          label={t.checkout.fullName}
          defaultValue={selectedAddress?.fullName ?? defaultName}
          error={fieldErrors.fullName?.[0]}
        />
        <Field
          key={`phone-${selectedAddressId}`}
          id="phone"
          name="phone"
          label={t.checkout.phone}
          defaultValue={selectedAddress?.phone ?? defaultPhone}
          error={fieldErrors.phone?.[0]}
        />
        {fulfillment === "DELIVERY" ? (
          <>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                <label htmlFor="savedAddress" className="block text-sm font-medium">
                  {t.checkout.savedAddress}
                </label>
                <select
                  id="savedAddress"
                  className="field"
                  value={selectedAddressId}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label}
                      {address.isDefault ? ` · ${t.checkout.default}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.checkout.saveAddressesPre}{" "}
                <Link href="/account/addresses" className="underline">
                  {t.checkout.saveAddressesLink}
                </Link>{" "}
                {t.checkout.saveAddressesPost}
              </p>
            )}
            <Field
              key={selectedAddressId || "new-address"}
              id="address"
              name="address"
              label={t.checkout.deliveryAddress}
              defaultValue={selectedAddress?.line ?? ""}
              error={fieldErrors.address?.[0]}
            />
          </>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium">
            {t.checkout.notes}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="field"
          />
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
        <h2 className="font-semibold text-primary">{t.checkout.orderSummary}</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
                {item.flavors ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {Object.entries(item.flavors)
                      .map(([flavor, qty]) => `${flavor} × ${qty}`)
                      .join(" · ")}
                  </span>
                ) : null}
              </span>
              <span>{formatPrice(item.priceCents * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <p className="flex justify-between">
            <span>{t.checkout.subtotal}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </p>
          <p className="flex justify-between">
            <span>{t.checkout.delivery}</span>
            <span>{delivery === 0 ? t.common.free : formatPrice(delivery, locale)}</span>
          </p>
          {discount > 0 ? (
            <p className="flex justify-between text-accent">
              <span>{t.checkout.pointsDiscount}</span>
              <span>−{formatPrice(discount, locale)}</span>
            </p>
          ) : null}
          <p className="flex justify-between text-base font-bold text-primary">
            <span>{t.checkout.total}</span>
            <span>{formatPrice(total, locale)}</span>
          </p>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={redeemPoints && canRedeem}
            disabled={!canRedeem}
            onChange={(event) => setRedeemPoints(event.target.checked)}
          />
          <span>
            {payWithMomo
              ? t.checkout.pointsCashOnly
              : canRedeem
                ? t.checkout.usePoints(
                    discount > 0
                      ? discount
                      : redeemableDiscount(points, subtotal),
                  )
                : points < 100
                  ? t.checkout.pointsBelowMin(points)
                  : t.checkout.pointsNeedSubtotal}
          </span>
        </label>
        <p className="text-xs text-muted-foreground">
          {t.checkout.earnsNote(
            earnedPoints,
            formatPrice(FREE_DELIVERY_FROM, locale),
            formatPrice(DELIVERY_FEE, locale),
          )}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full"
        >
          {pending
            ? t.checkout.placingOrder
            : payWithMomo
              ? t.checkout.payAmountMomo(formatPrice(total, locale))
              : t.checkout.placeOrder}
        </button>
      </aside>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        className="field"
      />
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </div>
  );
}
