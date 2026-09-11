import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Boxes,
  CheckCircle2,
  Clock,
  Eye,
  Gift,
  PackageX,
  ShoppingCart,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import {
  StatCard,
  StatGrid,
} from "@/components/admin/dashboard/primitives";
import {
  DashboardSkeleton,
  StatGridSkeleton,
} from "@/components/admin/dashboard/skeletons";
import {
  ActivityPanel,
  AlertsPanel,
  CategorySalesPanel,
  CustomerPanel,
  FulfilmentPanel,
  LoyaltyPanel,
  LowStockPanel,
  OrderStatusPanel,
  RecentOrdersPanel,
  SalesPanel,
  TopProductsPanel,
  VisitorsPanel,
} from "@/components/admin/dashboard/panels";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { formatPrice } from "@/lib/money";
import { requireStaff } from "@/server/admin/access";
import {
  getAdminAlerts,
  getCategorySales,
  getCustomerOverview,
  getFulfilmentSummary,
  getKpis,
  getLoyaltyOverview,
  getOrderStatusBreakdown,
  getRecentActivity,
  getRecentOrders,
  getSalesSeries,
  getStockAlerts,
  getTopProducts,
  getVisitorStats,
  resolveRange,
} from "@/server/admin/overview";

export const metadata: Metadata = { title: "Overview" };

type SearchParams = Promise<{ range?: string }>;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [user, { range: rangeParam }] = await Promise.all([
    requireStaff(),
    searchParams,
  ]);
  const range = resolveRange(rangeParam);
  const alerts = await getAdminAlerts();

  return (
    <main className="space-y-6">
      <DashboardHeader user={user} alertCount={alerts.total} />

      <Suspense key={`kpi-${range.key}-${rangeParam ?? ""}`} fallback={<StatGridSkeleton />}>
        <StatCards rangeParam={rangeParam} />
      </Suspense>

      <Suspense key={`body-${range.key}-${rangeParam ?? ""}`} fallback={<DashboardSkeleton />}>
        <DashboardBody rangeParam={rangeParam} />
      </Suspense>

      <QuickActions />
    </main>
  );
}

/* ---------------- KPI cards ---------------- */

async function StatCards({ rangeParam }: { rangeParam?: string }) {
  const range = resolveRange(rangeParam);
  const [k, visitors] = await Promise.all([getKpis(range), getVisitorStats(range)]);

  return (
    <StatGrid>
      <StatCard
        label="Visitors"
        value={visitors.visitors.toLocaleString()}
        icon={Eye}
        delta={visitors.visitorsDelta}
        deltaSuffix="vs previous"
        sub={`${visitors.views.toLocaleString()} page views`}
      />
      <StatCard
        label="Total revenue"
        value={formatPrice(k.revenue)}
        icon={Wallet}
        delta={k.revenueDelta}
        deltaSuffix="vs previous"
        href="/admin/orders"
      />
      <StatCard
        label="Revenue today"
        value={formatPrice(k.revenueToday)}
        icon={Wallet}
        sub="Since midnight"
      />
      <StatCard
        label="Total orders"
        value={String(k.orders)}
        icon={ShoppingCart}
        delta={k.ordersDelta}
        deltaSuffix="vs previous"
        href="/admin/orders"
      />
      <StatCard
        label="Pending orders"
        value={String(k.pending)}
        icon={Clock}
        tone={k.pending > 0 ? "warn" : "default"}
        sub="Awaiting confirmation"
        href="/admin/orders?status=PENDING"
      />
      <StatCard
        label="Completed orders"
        value={String(k.completed)}
        icon={CheckCircle2}
        sub="Received by customers"
      />
      <StatCard
        label="Total customers"
        value={String(k.customersTotal)}
        icon={Users}
        sub={`${k.customersNew} new in period`}
        href="/admin/customers"
      />
      <StatCard
        label="Total products"
        value={String(k.productsTotal)}
        icon={Boxes}
        sub={`${k.productsAvailable} available`}
        href="/admin/products"
      />
      <StatCard
        label="Low stock"
        value={String(k.lowStock)}
        icon={TriangleAlert}
        tone={k.lowStock > 0 ? "warn" : "default"}
        sub="At or below minimum"
        href="/admin/inventory"
      />
      <StatCard
        label="Out of stock"
        value={String(k.outOfStock)}
        icon={PackageX}
        tone={k.outOfStock > 0 ? "danger" : "default"}
        sub="Currently unavailable"
        href="/admin/inventory"
      />
      <StatCard
        label="Loyalty points"
        value={k.loyalty.active.toLocaleString()}
        icon={Gift}
        sub={`${k.loyalty.redeemed.toLocaleString()} redeemed to date`}
        href="/admin/customers"
      />
    </StatGrid>
  );
}

/* ---------------- Streamed analytics body ---------------- */

async function DashboardBody({ rangeParam }: { rangeParam?: string }) {
  const range = resolveRange(rangeParam);

  const [
    series,
    visitors,
    status,
    categories,
    recentOrders,
    topProducts,
    stockAlerts,
    fulfilment,
    customers,
    loyalty,
    alerts,
    activity,
  ] = await Promise.all([
    getSalesSeries(range),
    getVisitorStats(range),
    getOrderStatusBreakdown(),
    getCategorySales(range),
    getRecentOrders(8),
    getTopProducts(range, 5),
    getStockAlerts(6),
    getFulfilmentSummary(range),
    getCustomerOverview(range),
    getLoyaltyOverview(),
    getAdminAlerts(),
    getRecentActivity(8),
  ]);

  return (
    <div className="space-y-6">
      <SalesPanel series={series} rangeLabel={range.label} />
      <VisitorsPanel data={visitors} rangeLabel={range.label} />

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderStatusPanel data={status} />
        <CategorySalesPanel data={categories} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersPanel orders={recentOrders} />
        <TopProductsPanel products={topProducts} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LowStockPanel items={stockAlerts} />
        <FulfilmentPanel data={fulfilment} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CustomerPanel data={customers} />
        <LoyaltyPanel data={loyalty} />
      </div>

      <AlertsPanel data={alerts} />
      <ActivityPanel items={activity} />
    </div>
  );
}
