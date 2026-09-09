import type { Metadata } from "next";
import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
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
  { href: "/admin/orders", label: "All", status: undefined },
  { href: "/admin/orders?status=PENDING", label: "Pending", status: "PENDING" },
  { href: "/admin/orders?status=CONFIRMED", label: "Confirmed", status: "CONFIRMED" },
  { href: "/admin/orders?status=RECEIVED", label: "Received", status: "RECEIVED" },
  { href: "/admin/orders?status=CANCELLED", label: "Cancelled", status: "CANCELLED" },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const selected = FILTERS.some((filter) => filter.status === status)
    ? (status as OrderStatus)
    : undefined;
  const orders = await listAdminOrders(selected);

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
              href={filter.href}
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
                      <p>{order.fullName}</p>
                      <p className="text-xs text-muted-foreground">{order.phone}</p>
                    </td>
                    <td>
                      <OrderThumbs items={order.items} />
                    </td>
                    <td>{order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"}</td>
                    <td>
                      <StatusBadge status={order.status} />
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
