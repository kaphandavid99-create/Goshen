import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { getDict, getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";
import { listOrdersForUser } from "@/server/orders/queries";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.account.nav.orders };
}

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");
  const [orders, { locale, t }] = await Promise.all([
    listOrdersForUser(user.id),
    getI18n(),
  ]);

  return (
    <section>
      <h2 className="section-title">{t.account.orders.title}</h2>
      {orders.length === 0 ? (
        <p className="card mt-4 p-5 text-sm text-muted-foreground">
          {t.account.orders.empty}{" "}
          <Link href="/shop" className="btn-ghost">
            {t.account.orders.startShopping}
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={
                  order.status === "AWAITING_PAYMENT" && order.payment
                    ? `/pay/${order.payment.id}`
                    : `/account/orders/${order.id}`
                }
                className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-semibold text-primary">
                    {order.orderNumber}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {formatDate(order.createdAt, locale)} ·{" "}
                    {order.fulfillment === "DELIVERY"
                      ? t.account.orders.delivery
                      : t.account.orders.pickup}{" "}
                    · {t.account.orders.itemsCount(order.items.length)}
                  </span>
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-primary">
                    {formatPrice(order.totalCents, locale)}
                  </span>
                  <span className="mt-1 block text-muted-foreground">
                    {order.status === "AWAITING_PAYMENT"
                      ? t.pay.finishPayment
                      : order.status === "CONFIRMED"
                        ? t.account.orders.acceptedConfirm
                        : orderStatusLabel(order.status, locale)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
