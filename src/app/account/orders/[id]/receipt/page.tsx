import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintReceiptButton } from "@/components/orders/print-receipt-button";
import { formatDate } from "@/lib/dates";
import {
  formatFlavorSummary,
  normalizeFlavorQuantities,
} from "@/lib/flavors";
import { getDict, getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import { requireUser } from "@/server/auth/current-user";
import { getOrderForUser } from "@/server/orders/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.orders.receipt.kicker };
}

export default async function OrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [order, { locale, t }] = await Promise.all([
    getOrderForUser(user.id, id),
    getI18n(),
  ]);

  if (!order || !order.receivedAt) {
    notFound();
  }

  return (
    <section className="print-only-area max-w-2xl">
      <p className="kicker">{t.orders.receipt.kicker}</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <h1 className="page-title">{order.orderNumber}</h1>
        <PrintReceiptButton label={t.orders.receipt.print} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.orders.receipt.receivedOn(formatDate(order.receivedAt, locale))}{" "}
        {t.orders.receipt.keepForRecords}
      </p>

      <section className="card mt-8 p-6">
        <h2 className="font-semibold text-primary">{t.orders.items}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => {
            const flavors = formatFlavorSummary(
              normalizeFlavorQuantities(item.flavors),
            );
            return (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                  {flavors ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {flavors}
                    </span>
                  ) : null}
                  {item.product?.kind === "BUNDLE" &&
                  item.product.bundleItems.length > 0 ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t.bundles.contains}{" "}
                      {item.product.bundleItems
                        .map(
                          (part) =>
                            `${part.quantity}× ${part.product.name}`,
                        )
                        .join(", ")}
                    </span>
                  ) : null}
                </span>
                <span>{formatPrice(item.priceCents * item.quantity, locale)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <p className="flex justify-between">
            <span>{t.orders.subtotal}</span>
            <span>{formatPrice(order.subtotalCents, locale)}</span>
          </p>
          <p className="flex justify-between">
            <span>{t.orders.deliveryFee}</span>
            <span>
              {order.channel === "WHOLESALE"
                ? t.orders.arrangedAfter
                : order.deliveryCents === 0
                  ? t.common.free
                  : formatPrice(order.deliveryCents, locale)}
            </span>
          </p>
          {order.discountCents > 0 ? (
            <p className="flex justify-between text-accent">
              <span>{t.orders.pointsDiscount(order.pointsRedeemed)}</span>
              <span>−{formatPrice(order.discountCents, locale)}</span>
            </p>
          ) : null}
          <p className="flex justify-between font-bold text-primary">
            <span>{t.orders.total}</span>
            <span>{formatPrice(order.totalCents, locale)}</span>
          </p>
        </div>
      </section>

      <section className="card mt-6 p-6 text-sm">
        <p><span className="text-muted-foreground">{t.orders.name}</span> {order.fullName}</p>
        <p className="mt-1"><span className="text-muted-foreground">{t.orders.phone}</span> {order.phone}</p>
        {order.address ? (
          <p className="mt-1">
            <span className="text-muted-foreground">{t.orders.address}</span> {order.address}
          </p>
        ) : null}
      </section>

      <p className="mt-8 text-sm print:hidden">
        <Link href={`/account/orders/${order.id}`} className="btn-ghost">
          {t.orders.backToOrders}
        </Link>
      </p>
    </section>
  );
}
