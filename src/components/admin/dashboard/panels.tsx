import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  PackageX,
  ShoppingBag,
} from "lucide-react";
import { Avatar } from "@/components/account/avatar";
import { OrderThumbs } from "@/components/admin/order-thumbs";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  DashboardSection,
  MiniStat,
} from "@/components/admin/dashboard/primitives";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type {
  getCustomerOverview,
  getFulfilmentSummary,
  getLoyaltyOverview,
  getRecentActivity,
  getRecentOrders,
  getStockAlerts,
  getTopProducts,
  getAdminAlerts,
  getVisitorStats,
} from "@/server/admin/overview";
import {
  GrowthSpark,
  OrderStatusChart,
  SalesChart,
  VisitorsChart,
} from "@/components/admin/dashboard/charts";
import type {
  getCategorySales,
  getOrderStatusBreakdown,
  getSalesSeries,
} from "@/server/admin/overview";

type Recent = Awaited<ReturnType<typeof getRecentOrders>>;
type Top = Awaited<ReturnType<typeof getTopProducts>>;
type Stock = Awaited<ReturnType<typeof getStockAlerts>>;
type Fulfilment = Awaited<ReturnType<typeof getFulfilmentSummary>>;
type Customers = Awaited<ReturnType<typeof getCustomerOverview>>;
type Loyalty = Awaited<ReturnType<typeof getLoyaltyOverview>>;
type Activity = Awaited<ReturnType<typeof getRecentActivity>>;
type Alerts = Awaited<ReturnType<typeof getAdminAlerts>>;
type Series = Awaited<ReturnType<typeof getSalesSeries>>;
type Status = Awaited<ReturnType<typeof getOrderStatusBreakdown>>;
type Category = Awaited<ReturnType<typeof getCategorySales>>;
type Visitors = Awaited<ReturnType<typeof getVisitorStats>>;

function paymentLabel(
  status: string,
  payment?: { method: string; status: string } | null,
) {
  if (payment?.method === "MOMO") {
    if (payment.status === "SUCCEEDED")
      return { text: "Paid · MoMo", tone: "text-[var(--delta-up)]" };
    if (payment.status === "FAILED")
      return { text: "MoMo failed", tone: "text-muted-foreground" };
    return { text: "Awaiting MoMo", tone: "text-muted-foreground" };
  }
  if (status === "RECEIVED") return { text: "Paid · cash", tone: "text-[var(--delta-up)]" };
  if (status === "CANCELLED") return { text: "Voided", tone: "text-muted-foreground" };
  return { text: "On collection", tone: "text-muted-foreground" };
}

/* ---------------- Sales analytics ---------------- */

export function SalesPanel({
  series,
  rangeLabel,
}: {
  series: Series;
  rangeLabel: string;
}) {
  return (
    <DashboardSection
      title="Sales analytics"
      description={`Revenue and orders · ${rangeLabel.toLowerCase()}`}
      isEmpty={series.totalOrders === 0}
      empty="No sales data available yet."
    >
      <div className="mb-3 flex flex-wrap gap-4 text-sm">
        <span>
          <span className="text-muted-foreground">Revenue </span>
          <span className="font-bold text-primary">
            {formatPrice(series.totalRevenueCents)}
          </span>
        </span>
        <span>
          <span className="text-muted-foreground">Orders </span>
          <span className="font-bold text-primary">{series.totalOrders}</span>
        </span>
      </div>
      <SalesChart points={series.points} />
    </DashboardSection>
  );
}

/* ---------------- Shop visitors ---------------- */

export function VisitorsPanel({
  data,
  rangeLabel,
}: {
  data: Visitors;
  rangeLabel: string;
}) {
  return (
    <DashboardSection
      title="Shop visitors"
      description={`People browsing the storefront · ${rangeLabel.toLowerCase()}`}
      isEmpty={data.views === 0}
      empty="No visits recorded yet."
    >
      <div className="mb-3 flex flex-wrap gap-4 text-sm">
        <span>
          <span className="text-muted-foreground">Visitors </span>
          <span className="font-bold text-primary">{data.visitors.toLocaleString()}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Page views </span>
          <span className="font-bold text-primary">{data.views.toLocaleString()}</span>
        </span>
      </div>
      <VisitorsChart points={data.points} />
    </DashboardSection>
  );
}

/* ---------------- Order status ---------------- */

export function OrderStatusPanel({ data }: { data: Status }) {
  return (
    <DashboardSection
      title="Order status"
      description="Every order by current stage"
      isEmpty={data.total === 0}
      empty="No orders yet."
    >
      <OrderStatusChart items={data.items} total={data.total} />
    </DashboardSection>
  );
}

/* ---------------- Sales by category ---------------- */

export function CategorySalesPanel({ data }: { data: Category }) {
  const max = Math.max(1, ...data.map((d) => d.revenueCents));
  return (
    <DashboardSection
      title="Sales by category"
      description="Share of revenue in the selected period"
      isEmpty={data.length === 0}
      empty="No category sales yet."
    >
      <ul className="space-y-3">
        {data.map((c) => (
          <li key={c.category}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-medium text-foreground">
                {c.category}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {formatPrice(c.revenueCents)}{" "}
                <span className="text-xs">({Math.round(c.pct)}%)</span>
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--chart-revenue)]"
                style={{ width: `${Math.max(3, (c.revenueCents / max) * 100)}%` }}
              />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.units} unit{c.units === 1 ? "" : "s"} sold
            </p>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}

/* ---------------- Recent orders ---------------- */

export function RecentOrdersPanel({ orders }: { orders: Recent }) {
  return (
    <DashboardSection
      title="Recent orders"
      description="Latest activity across the store"
      actionLabel="View all orders"
      actionHref="/admin/orders"
      isEmpty={orders.length === 0}
      empty="No orders yet."
      bodyClassName="overflow-hidden"
    >
      {/* table on >= sm */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const pay = paymentLabel(o.status, o.payment);
              const count = o.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <tr key={o.id}>
                  <td>
                    <span className="font-semibold text-primary">
                      {o.orderNumber}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </p>
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <Avatar name={o.user.name} url={o.user.avatarUrl} size={28} />
                      <span className="min-w-0 truncate">{o.user.name}</span>
                    </span>
                  </td>
                  <td className="text-muted-foreground">{count}</td>
                  <td className="font-medium">{formatPrice(o.totalCents)}</td>
                  <td className={cn("text-xs font-medium", pay.tone)}>{pay.text}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* stacked cards on mobile */}
      <ul className="space-y-3 sm:hidden">
        {orders.map((o) => {
          const pay = paymentLabel(o.status, o.payment);
          const count = o.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <li key={o.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-primary">{o.orderNumber}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {o.user.name} · {formatDate(o.createdAt)}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {count} item{count === 1 ? "" : "s"} · {pay.text}
                </span>
                <span className="font-semibold">{formatPrice(o.totalCents)}</span>
              </div>
              <Link
                href={`/admin/orders/${o.id}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                View order <ArrowUpRight className="size-3" />
              </Link>
            </li>
          );
        })}
      </ul>
    </DashboardSection>
  );
}

/* ---------------- Top selling products ---------------- */

export function TopProductsPanel({ products }: { products: Top }) {
  return (
    <DashboardSection
      title="Top selling products"
      description="By units sold in the selected period"
      actionLabel="View all products"
      actionHref="/admin/products"
      isEmpty={products.length === 0}
      empty="No sales data available yet."
    >
      <ul className="space-y-3">
        {products.map((p, index) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-primary">
                {p.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {p.category} · {p.stockCount} in stock
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold text-primary">
                {p.unitsSold} sold
              </span>
              <span className="block text-xs text-muted-foreground">
                {formatPrice(p.revenueCents)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}

/* ---------------- Low stock alert ---------------- */

export function LowStockPanel({ items }: { items: Stock }) {
  return (
    <DashboardSection
      title="Low stock alert"
      description="Products at or below their minimum level"
      actionLabel="Manage inventory"
      actionHref="/admin/inventory"
      accent={items.length > 0}
      isEmpty={items.length === 0}
      empty="All products are above their minimum stock level."
    >
      <ul className="space-y-3">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-primary">
                {p.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {p.category} · min {p.lowStockAt}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-bold text-primary">
                {p.stockCount}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  p.status === "OUT"
                    ? "bg-[var(--delta-down)]/12 text-[var(--delta-down)]"
                    : "bg-[var(--status-pending)]/15 text-[var(--status-pending)]",
                )}
              >
                {p.status === "OUT" ? (
                  <PackageX className="size-3" />
                ) : (
                  <AlertTriangle className="size-3" />
                )}
                {p.status === "OUT" ? "Out of stock" : "Low stock"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}

/* ---------------- Fulfilment & collection ---------------- */

export function FulfilmentPanel({ data }: { data: Fulfilment }) {
  const totalOrders = data.deliveryCount + data.pickupCount;
  const deliveryPct =
    totalOrders > 0 ? Math.round((data.deliveryCount / totalOrders) * 100) : 0;

  return (
    <DashboardSection
      title="Fulfilment & collection"
      description="Goshen collects payment on delivery or pickup"
      isEmpty={totalOrders === 0 && data.collectedCents === 0}
      empty="No fulfilment data available yet."
    >
      <div className="grid grid-cols-2 gap-3">
        <MiniStat
          label="Collected"
          value={formatPrice(data.collectedCents)}
          sub={`${data.collectedCount} completed`}
        />
        <MiniStat
          label="Outstanding"
          value={formatPrice(data.outstandingCents)}
          sub={`${data.outstandingCount} awaiting`}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Delivery {data.deliveryCount}</span>
          <span>Pickup {data.pickupCount}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${deliveryPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Delivery fees collected: {formatPrice(data.deliveryFeesCents)}
        </p>
      </div>
    </DashboardSection>
  );
}

/* ---------------- Customer overview ---------------- */

export function CustomerPanel({ data }: { data: Customers }) {
  return (
    <DashboardSection
      title="Customer overview"
      actionLabel="View customers"
      actionHref="/admin/customers"
      isEmpty={data.total === 0}
      empty="No customers registered yet."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Total" value={String(data.total)} />
        <MiniStat label="New" value={String(data.newInRange)} sub="in period" />
        <MiniStat label="Returning" value={String(data.returning)} />
        <MiniStat label="Purchasers" value={String(data.purchasers)} />
        <MiniStat
          label="Avg spend"
          value={formatPrice(data.avgSpendCents)}
          sub="per purchaser"
        />
      </div>
      <div className="mt-4">
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          Customer growth
        </p>
        {data.growth.length > 1 ? (
          <GrowthSpark points={data.growth} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Not enough history for a trend yet.
          </p>
        )}
      </div>
    </DashboardSection>
  );
}

/* ---------------- Loyalty overview ---------------- */

export function LoyaltyPanel({ data }: { data: Loyalty }) {
  return (
    <DashboardSection
      title="Loyalty overview"
      description={`Reward value: ${formatPrice(data.pointValueCents)} per point`}
      actionLabel="Manage loyalty"
      actionHref="/admin/customers"
      isEmpty={data.issued === 0}
      empty="No loyalty points issued yet."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Issued (est.)" value={data.issued.toLocaleString()} />
        <MiniStat label="Redeemed" value={data.redeemed.toLocaleString()} />
        <MiniStat label="Active" value={data.active.toLocaleString()} />
        <MiniStat
          label="Redemptions"
          value={String(data.redemptionCount)}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Active points are worth {formatPrice(data.activeValueCents)} ·{" "}
        {formatPrice(data.redeemedValueCents)} redeemed to date.
      </p>

      {data.topCustomers.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Most active loyalty customers
          </p>
          <ul className="space-y-2">
            {data.topCustomers.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <Avatar name={c.name} url={c.avatarUrl} size={24} />
                <span className="min-w-0 truncate">{c.name}</span>
                <span className="ml-auto font-semibold text-primary">
                  {c.points.toLocaleString()} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </DashboardSection>
  );
}

/* ---------------- Alerts ---------------- */

export function AlertsPanel({ data }: { data: Alerts }) {
  const toneClass: Record<string, string> = {
    danger: "border-[var(--delta-down)]/40 bg-[var(--delta-down)]/8",
    warn: "border-[var(--status-pending)]/40 bg-[var(--status-pending)]/10",
    info: "border-border bg-background/40",
  };

  return (
    <DashboardSection
      title="Alerts"
      description="Live signals that need your attention"
      actionLabel="View all notifications"
      actionHref="/admin/orders"
      isEmpty={data.alerts.length === 0}
      empty="Nothing needs your attention right now."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {data.alerts.map((a) => (
          <li key={a.id}>
            <Link
              href={a.href}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition hover:border-primary/40",
                toneClass[a.tone],
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-sm font-bold text-primary">
                {a.count}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {a.title}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}

/* ---------------- Recent admin activity ---------------- */

export function ActivityPanel({ items }: { items: Activity }) {
  return (
    <DashboardSection
      title="Recent admin activity"
      description="Changes made by shop staff"
      actionLabel="View activity"
      actionHref="/admin/activity"
      isEmpty={items.length === 0}
      empty="No admin activity recorded yet."
    >
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5">
              <ShoppingBag className="size-4 text-muted-foreground" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-foreground">{a.summary}</span>
              <span className="block text-xs text-muted-foreground">
                {a.actor?.name ?? "System"} · {formatDateTime(a.createdAt)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardSection>
  );
}
