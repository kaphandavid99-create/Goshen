import type { Metadata } from "next";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import Link from "next/link";
import { Avatar } from "@/components/account/avatar";
import { ConfirmOrderButton } from "@/components/admin/confirm-order-button";
import { OrderThumbs } from "@/components/admin/order-thumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { listAdminOrders } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Orders",
};

const FILTERS = [
  { label: "All", status: undefined },
  { label: "Pending", status: "PENDING" },
  { label: "Confirmed", status: "CONFIRMED" },
  { label: "Received", status: "RECEIVED" },
  { label: "Cancelled", status: "CANCELLED" },
] as const;

const PAYMENT_FILTERS = [
  { label: "All", paymentStatus: undefined },
  { label: "Pending Payment", paymentStatus: "PENDING" },
  { label: "Paid", paymentStatus: "SUCCEEDED" },
  { label: "Failed", paymentStatus: "FAILED" },
] as const;

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCEEDED: "Paid",
  FAILED: "Failed",
};

function filterHref(status: OrderStatus | undefined, paymentStatus: PaymentStatus | undefined) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (paymentStatus) params.set("paymentStatus", paymentStatus);
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; paymentStatus?: string }>;
}) {
  const { status, paymentStatus } = await searchParams;
  const selected = FILTERS.some((filter) => filter.status === status)
    ? (status as OrderStatus)
    : undefined;
  const selectedPayment = PAYMENT_FILTERS.some(
    (filter) => filter.paymentStatus === paymentStatus,
  )
    ? (paymentStatus as PaymentStatus)
    : undefined;
  const orders = await listAdminOrders(selected, selectedPayment);

  return (
    <main>
      <p className="kicker">Operations</p>
      <h1 className="page-title mt-1">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirm new orders, then wait for the customer to mark them as received.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Order status">
        {FILTERS.map((filter) => {
          const active = filter.status === selected;
          return (
            <Link
              key={filter.label}
              href={filterHref(filter.status, selectedPayment)}
              className={
                active
                  ? "rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground hover:border-primary"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <nav className="mt-3 flex flex-wrap gap-2" aria-label="Payment status">
        {PAYMENT_FILTERS.map((filter) => {
          const active = filter.paymentStatus === selectedPayment;
          return (
            <Link
              key={filter.label}
              href={filterHref(selected, filter.paymentStatus)}
              className={
                active
                  ? "rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  : "rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:border-primary"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <section className="card mt-6 overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No orders in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Fulfillment</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </p>
                      {order.channel === "WHOLESALE" ? (
                        <span className="mt-1 inline-flex rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                          Wholesale
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        {order.user.avatarUrl ? (
                          <a
                            href={order.user.avatarUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="View full photo"
                          >
                            <Avatar name={order.user.name} url={order.user.avatarUrl} size={32} />
                          </a>
                        ) : (
                          <Avatar name={order.user.name} url={null} size={32} />
                        )}
                        <div>
                          <p>{order.fullName}</p>
                          <p className="text-xs text-muted-foreground">{order.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`}>
                        <OrderThumbs items={order.items} />
                      </Link>
                    </td>
                    <td>{order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      {order.payment ? (
                        <>
                          <p>{order.payment.method === "MOMO" ? "MTN MoMo" : "Cash"}</p>
                          <p className="text-xs text-muted-foreground">
                            {PAYMENT_STATUS_LABEL[order.payment.status]}
                            {order.payment.paidAt
                              ? ` · ${formatDateTime(order.payment.paidAt)}`
                              : ""}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="font-medium">{formatPrice(order.totalCents)}</td>
                    <td>
                      <ConfirmOrderButton orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
