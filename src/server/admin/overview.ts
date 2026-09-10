import "server-only";

import { Prisma } from "@prisma/client";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { POINT_VALUE_FCFA } from "@/lib/constants";

/**
 * The dashboard fans out a lot of queries at once. On a remote pooled database
 * (Supabase transaction pooler) a slow link or a momentarily saturated pool
 * shows up as a transient "can't reach database server" (P1001) / timeout
 * (P1002) / closed-connection (P1017). Those clear on a quick retry, so wrap
 * each read batch rather than 500-ing the whole page.
 */
async function withRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const code =
        error instanceof Prisma.PrismaClientKnownRequestError
          ? error.code
          : error instanceof Prisma.PrismaClientInitializationError
            ? error.errorCode
            : undefined;
      const retryable =
        code === "P1001" ||
        code === "P1002" ||
        code === "P1008" ||
        code === "P1017";
      if (!retryable || attempt >= attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Date range                                                          */
/* ------------------------------------------------------------------ */

export type RangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "last-month"
  | "year"
  | "custom";

export type ResolvedRange = {
  key: RangeKey;
  label: string;
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  bucket: "hour" | "day" | "month";
};

const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseCustom(raw?: string) {
  if (!raw) return null;
  const [, from, to] = raw.split(":");
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (!start || !end || Number.isNaN(+start) || Number.isNaN(+end)) return null;
  return { start: startOfDay(start), end: new Date(startOfDay(end).getTime() + DAY) };
}

export function resolveRange(param?: string): ResolvedRange {
  const now = new Date();
  const todayStart = startOfDay(now);
  const key = (param?.startsWith("custom") ? "custom" : param ?? "30d") as RangeKey;

  const span = (start: Date, end: Date, bucket: ResolvedRange["bucket"], label: string) => {
    const len = end.getTime() - start.getTime();
    return {
      key,
      label,
      start,
      end,
      prevStart: new Date(start.getTime() - len),
      prevEnd: new Date(start.getTime()),
      bucket,
    };
  };

  switch (key) {
    case "today":
      return span(todayStart, now, "hour", "Today");
    case "yesterday": {
      const y = new Date(todayStart.getTime() - DAY);
      return span(y, todayStart, "hour", "Yesterday");
    }
    case "7d":
      return span(new Date(todayStart.getTime() - 6 * DAY), now, "day", "Last 7 days");
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return span(first, now, "day", "This month");
    }
    case "last-month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return span(first, end, "day", "Last month");
    }
    case "year": {
      const first = new Date(now.getFullYear(), 0, 1);
      return span(first, now, "month", "This year");
    }
    case "custom": {
      const c = parseCustom(param);
      if (c) {
        const days = (c.end.getTime() - c.start.getTime()) / DAY;
        return span(c.start, c.end, days > 92 ? "month" : "day", "Custom range");
      }
      return span(new Date(todayStart.getTime() - 29 * DAY), now, "day", "Last 30 days");
    }
    default:
      return span(new Date(todayStart.getTime() - 29 * DAY), now, "day", "Last 30 days");
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

// Excludes cancelled orders and MoMo orders still waiting on payment (which
// aren't real revenue and the shop never sees).
const NOT_CANCELLED = {
  status: {
    notIn: ["CANCELLED", "AWAITING_PAYMENT"] satisfies OrderStatus[],
  },
};

/** Percentage change vs previous period. `null` when there is no baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

function bucketKey(d: Date, bucket: ResolvedRange["bucket"]) {
  if (bucket === "hour") {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
  }
  if (bucket === "month") {
    return `${d.getFullYear()}-${d.getMonth()}`;
  }
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildBuckets(range: ResolvedRange) {
  const out: { key: string; label: string; t: number }[] = [];
  const cursor = new Date(range.start);

  while (cursor < range.end) {
    if (range.bucket === "hour") {
      out.push({
        key: bucketKey(cursor, "hour"),
        label: `${String(cursor.getHours()).padStart(2, "0")}:00`,
        t: cursor.getTime(),
      });
      cursor.setHours(cursor.getHours() + 1);
    } else if (range.bucket === "month") {
      out.push({
        key: bucketKey(cursor, "month"),
        label: cursor.toLocaleDateString("en-GB", { month: "short" }),
        t: cursor.getTime(),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    } else {
      out.push({
        key: bucketKey(cursor, "day"),
        label: cursor.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        t: cursor.getTime(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  KPIs                                                                */
/* ------------------------------------------------------------------ */

export async function getKpis(range: ResolvedRange) {
  const now = new Date();
  const todayStart = startOfDay(now);

  const [
    revNow,
    revPrev,
    revToday,
    ordersNow,
    ordersPrev,
    pending,
    completed,
    customersTotal,
    customersNew,
    productsTotal,
    productsAvailable,
    outOfStock,
    lowStockRows,
    activePoints,
    redeemedPoints,
  ] = await withRetry(() => Promise.all([
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { ...NOT_CANCELLED, createdAt: { gte: range.start, lt: range.end } },
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { ...NOT_CANCELLED, createdAt: { gte: range.prevStart, lt: range.prevEnd } },
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { ...NOT_CANCELLED, createdAt: { gte: todayStart } },
    }),
    prisma.order.count({
      where: { ...NOT_CANCELLED, createdAt: { gte: range.start, lt: range.end } },
    }),
    prisma.order.count({
      where: {
        ...NOT_CANCELLED,
        createdAt: { gte: range.prevStart, lt: range.prevEnd },
      },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "RECEIVED" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: range.start, lt: range.end } },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { stockCount: { gt: 0 } } }),
    prisma.product.count({ where: { stockCount: { lte: 0 } } }),
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT COUNT(*) AS n FROM "Product" WHERE "stockCount" > 0 AND "stockCount" <= "lowStockAt"`,
    prisma.user.aggregate({ _sum: { points: true } }),
    prisma.order.aggregate({
      _sum: { pointsRedeemed: true },
      where: { pointsRedeemed: { gt: 0 } },
    }),
  ]));

  const revenue = revNow._sum.totalCents ?? 0;
  const revenuePrev = revPrev._sum.totalCents ?? 0;
  const active = activePoints._sum.points ?? 0;
  const redeemed = redeemedPoints._sum.pointsRedeemed ?? 0;
  const lowStock = Number(lowStockRows[0]?.n ?? 0);

  return {
    revenue,
    revenueDelta: pctChange(revenue, revenuePrev),
    revenueToday: revToday._sum.totalCents ?? 0,
    orders: ordersNow,
    ordersDelta: pctChange(ordersNow, ordersPrev),
    pending,
    completed,
    customersTotal,
    customersNew,
    productsTotal,
    productsAvailable,
    outOfStock,
    lowStock,
    loyalty: {
      active,
      redeemed,
      issued: active + redeemed,
      redeemedValueCents: redeemed * POINT_VALUE_FCFA,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Sales series (revenue + orders over time)                           */
/* ------------------------------------------------------------------ */

export async function getSalesSeries(range: ResolvedRange) {
  const orders = await withRetry(() =>
    prisma.order.findMany({
      where: { ...NOT_CANCELLED, createdAt: { gte: range.start, lt: range.end } },
      select: { createdAt: true, totalCents: true },
    }),
  );

  const buckets = buildBuckets(range);
  const map = new Map(buckets.map((b) => [b.key, { revenueCents: 0, orders: 0 }]));

  for (const o of orders) {
    const entry = map.get(bucketKey(o.createdAt, range.bucket));
    if (entry) {
      entry.revenueCents += o.totalCents;
      entry.orders += 1;
    }
  }

  const points = buckets.map((b) => ({
    label: b.label,
    revenueCents: map.get(b.key)!.revenueCents,
    orders: map.get(b.key)!.orders,
  }));

  return {
    points,
    totalRevenueCents: orders.reduce((s, o) => s + o.totalCents, 0),
    totalOrders: orders.length,
  };
}

/* ------------------------------------------------------------------ */
/*  Order-status breakdown                                              */
/* ------------------------------------------------------------------ */

export async function getOrderStatusBreakdown() {
  const rows = await withRetry(() =>
    prisma.order.groupBy({
      by: ["status"],
      where: { status: { not: "AWAITING_PAYMENT" } },
      _count: { status: true },
      orderBy: { status: "asc" },
    }),
  );
  const order = ["PENDING", "CONFIRMED", "RECEIVED", "CANCELLED"] as const;
  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    RECEIVED: "Completed",
    CANCELLED: "Cancelled",
  };
  const counts = new Map(rows.map((r) => [r.status, r._count.status]));
  const total = rows.reduce((s, r) => s + r._count.status, 0);
  return {
    total,
    items: order.map((s) => ({
      status: s,
      label: labels[s],
      count: counts.get(s) ?? 0,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Sales by category                                                  */
/* ------------------------------------------------------------------ */

export async function getCategorySales(range: ResolvedRange) {
  const items = await withRetry(() =>
    prisma.orderItem.findMany({
      where: {
        order: { ...NOT_CANCELLED, createdAt: { gte: range.start, lt: range.end } },
      },
      select: {
        quantity: true,
        priceCents: true,
        product: { select: { category: { select: { name: true } } } },
      },
    }),
  );

  const map = new Map<string, { units: number; revenueCents: number }>();
  for (const it of items) {
    const name = it.product?.category?.name ?? "Uncategorised";
    const entry = map.get(name) ?? { units: 0, revenueCents: 0 };
    entry.units += it.quantity;
    entry.revenueCents += it.priceCents * it.quantity;
    map.set(name, entry);
  }

  const totalRevenue = [...map.values()].reduce((s, e) => s + e.revenueCents, 0);
  return [...map.entries()]
    .map(([category, e]) => ({
      category,
      units: e.units,
      revenueCents: e.revenueCents,
      pct: totalRevenue > 0 ? (e.revenueCents / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

/* ------------------------------------------------------------------ */
/*  Top-selling products                                               */
/* ------------------------------------------------------------------ */

export async function getTopProducts(range: ResolvedRange, take = 5) {
  const grouped = await withRetry(() =>
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { ...NOT_CANCELLED, createdAt: { gte: range.start, lt: range.end } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take,
    }),
  );

  const ids = grouped.map((g) => g.productId!).filter(Boolean);
  if (ids.length === 0) return [];

  const [products, revenueRows] = await withRetry(() => Promise.all([
    prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        stockCount: true,
        lowStockAt: true,
        category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    }),
    prisma.$queryRaw<{ productId: string; revenue: bigint }[]>`
      SELECT oi."productId" AS "productId", SUM(oi."priceCents" * oi."quantity") AS revenue
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE oi."productId" IN (${Prisma.join(ids)})
        AND o.status::text <> 'CANCELLED'
        AND o."createdAt" >= ${range.start} AND o."createdAt" < ${range.end}
      GROUP BY oi."productId"`,
  ]));

  const byId = new Map(products.map((p) => [p.id, p]));
  const revById = new Map(revenueRows.map((r) => [r.productId, Number(r.revenue)]));

  return grouped
    .map((g) => {
      const p = byId.get(g.productId!);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name ?? "Uncategorised",
        imageUrl: p.images[0]?.url ?? null,
        unitsSold: g._sum.quantity ?? 0,
        revenueCents: revById.get(g.productId!) ?? 0,
        stockCount: p.stockCount,
        lowStockAt: p.lowStockAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/* ------------------------------------------------------------------ */
/*  Recent orders                                                       */
/* ------------------------------------------------------------------ */

export async function getRecentOrders(take = 8) {
  return withRetry(() =>
    prisma.order.findMany({
      take,
      where: { status: { not: "AWAITING_PAYMENT" } },
      orderBy: { createdAt: "desc" },
      include: {
        payment: { select: { method: true, status: true } },
        user: { select: { name: true, email: true, avatarUrl: true } },
        items: {
          include: {
            product: {
              select: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: "asc" },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    }),
  );
}

/* ------------------------------------------------------------------ */
/*  Stock alerts                                                        */
/* ------------------------------------------------------------------ */

export async function getStockAlerts(take = 8) {
  const rows = await withRetry(
    () =>
      prisma.$queryRaw<
        {
          id: string;
          name: string;
          slug: string;
          stockCount: number;
          lowStockAt: number;
        }[]
      >`
    SELECT id, name, slug, "stockCount", "lowStockAt"
    FROM "Product"
    WHERE "stockCount" <= "lowStockAt"
    ORDER BY "stockCount" ASC, name ASC
    LIMIT ${take}`,
  );

  if (rows.length === 0) return [];

  const meta = await withRetry(() =>
    prisma.product.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
      select: {
        id: true,
        category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    }),
  );
  const byId = new Map(meta.map((m) => [m.id, m]));

  return rows.map((r) => ({
    ...r,
    stockCount: Number(r.stockCount),
    lowStockAt: Number(r.lowStockAt),
    category: byId.get(r.id)?.category?.name ?? "Uncategorised",
    imageUrl: byId.get(r.id)?.images[0]?.url ?? null,
    status: Number(r.stockCount) <= 0 ? ("OUT" as const) : ("LOW" as const),
  }));
}

/* ------------------------------------------------------------------ */
/*  Fulfilment & collection                                             */
/* ------------------------------------------------------------------ */

export async function getFulfilmentSummary(range: ResolvedRange) {
  const where = { createdAt: { gte: range.start, lt: range.end } };

  const [collected, outstanding, delivery, pickup, deliveryFees] =
    await withRetry(() => Promise.all([
      prisma.order.aggregate({
        _sum: { totalCents: true },
        _count: { _all: true },
        where: { ...where, status: "RECEIVED" },
      }),
      prisma.order.aggregate({
        _sum: { totalCents: true },
        _count: { _all: true },
        where: { ...where, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.order.count({ where: { ...where, fulfillment: "DELIVERY" } }),
      prisma.order.count({ where: { ...where, fulfillment: "PICKUP" } }),
      prisma.order.aggregate({
        _sum: { deliveryCents: true },
        where: { ...where, ...NOT_CANCELLED },
      }),
    ]));

  return {
    collectedCents: collected._sum.totalCents ?? 0,
    collectedCount: collected._count._all,
    outstandingCents: outstanding._sum.totalCents ?? 0,
    outstandingCount: outstanding._count._all,
    deliveryCount: delivery,
    pickupCount: pickup,
    deliveryFeesCents: deliveryFees._sum.deliveryCents ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Customer overview                                                   */
/* ------------------------------------------------------------------ */

export async function getCustomerOverview(range: ResolvedRange) {
  const [total, newInRange, purchaserRows, returningRows, revenueAgg, growthUsers] =
    await withRetry(() => Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: range.start, lt: range.end } },
      }),
      prisma.$queryRaw<{ n: bigint }[]>`
        SELECT COUNT(DISTINCT "userId") AS n FROM "Order" WHERE status::text <> 'CANCELLED'`,
      prisma.$queryRaw<{ n: bigint }[]>`
        SELECT COUNT(*) AS n FROM (
          SELECT "userId" FROM "Order" WHERE status::text <> 'CANCELLED'
          GROUP BY "userId" HAVING COUNT(*) > 1
        ) t`,
      prisma.order.aggregate({ _sum: { totalCents: true }, where: NOT_CANCELLED }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]));

  const purchasers = Number(purchaserRows[0]?.n ?? 0);
  const returning = Number(returningRows[0]?.n ?? 0);
  const revenue = revenueAgg._sum.totalCents ?? 0;

  // cumulative registration series across the selected range
  const buckets = buildBuckets(range);
  const priorTotal = growthUsers.filter((u) => u.createdAt < range.start).length;
  let running = priorTotal;
  const growth = buckets.map((b) => {
    const bStart = b.t;
    const bEnd =
      range.bucket === "hour"
        ? bStart + 3_600_000
        : range.bucket === "month"
          ? new Date(new Date(bStart).getFullYear(), new Date(bStart).getMonth() + 1, 1).getTime()
          : bStart + DAY;
    running += growthUsers.filter(
      (u) => u.createdAt.getTime() >= bStart && u.createdAt.getTime() < bEnd,
    ).length;
    return { label: b.label, total: running };
  });

  return {
    total,
    newInRange,
    returning,
    purchasers,
    avgSpendCents: purchasers > 0 ? Math.round(revenue / purchasers) : 0,
    growth,
  };
}

/* ------------------------------------------------------------------ */
/*  Loyalty overview                                                    */
/* ------------------------------------------------------------------ */

export async function getLoyaltyOverview() {
  const [activeAgg, redeemedAgg, redemptionCount, topCustomers] =
    await withRetry(() => Promise.all([
      prisma.user.aggregate({ _sum: { points: true }, where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({
        _sum: { pointsRedeemed: true },
        where: { pointsRedeemed: { gt: 0 } },
      }),
      prisma.order.count({ where: { pointsRedeemed: { gt: 0 } } }),
      prisma.user.findMany({
        where: { role: "CUSTOMER", points: { gt: 0 } },
        orderBy: { points: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, avatarUrl: true, points: true },
      }),
    ]));

  const active = activeAgg._sum.points ?? 0;
  const redeemed = redeemedAgg._sum.pointsRedeemed ?? 0;

  return {
    active,
    redeemed,
    issued: active + redeemed,
    redemptionCount,
    pointValueCents: POINT_VALUE_FCFA,
    activeValueCents: active * POINT_VALUE_FCFA,
    redeemedValueCents: redeemed * POINT_VALUE_FCFA,
    topCustomers: topCustomers.map((c) => ({
      ...c,
      valueCents: c.points * POINT_VALUE_FCFA,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Derived alerts                                                      */
/* ------------------------------------------------------------------ */

export async function getAdminAlerts() {
  const todayStart = startOfDay(new Date());

  const [pendingOrders, outOfStock, lowStockRows, newCustomers, wholesaleApps, cakeBookings] =
    await withRetry(() => Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { stockCount: { lte: 0 } } }),
      prisma.$queryRaw<{ n: bigint }[]>`
        SELECT COUNT(*) AS n FROM "Product" WHERE "stockCount" > 0 AND "stockCount" <= "lowStockAt"`,
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: todayStart } } }),
      prisma.wholesaleApplication.count({ where: { status: "PENDING" } }),
      prisma.cakeBooking.count({ where: { status: "NEW" } }),
    ]));

  const lowStock = Number(lowStockRows[0]?.n ?? 0);

  const alerts = [
    {
      id: "pending-orders",
      tone: "warn" as const,
      count: pendingOrders,
      title: "Orders awaiting confirmation",
      href: "/admin/orders?status=PENDING",
    },
    {
      id: "out-of-stock",
      tone: "danger" as const,
      count: outOfStock,
      title: "Products out of stock",
      href: "/admin/inventory",
    },
    {
      id: "low-stock",
      tone: "warn" as const,
      count: lowStock,
      title: "Products low on stock",
      href: "/admin/inventory",
    },
    {
      id: "new-customers",
      tone: "info" as const,
      count: newCustomers,
      title: "New customers today",
      href: "/admin/customers",
    },
    {
      id: "wholesale-apps",
      tone: "info" as const,
      count: wholesaleApps,
      title: "Wholesale applications to review",
      href: "/admin/wholesale",
    },
    {
      id: "cake-bookings",
      tone: "info" as const,
      count: cakeBookings,
      title: "New cake booking requests",
      href: "/admin/cakes",
    },
  ].filter((a) => a.count > 0);

  return { alerts, total: alerts.reduce((s, a) => s + a.count, 0) };
}

/* ------------------------------------------------------------------ */
/*  Recent admin activity                                               */
/* ------------------------------------------------------------------ */

export async function getRecentActivity(take = 8) {
  return withRetry(() =>
    prisma.adminActivity.findMany({
      take,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, avatarUrl: true } } },
    }),
  );
}
