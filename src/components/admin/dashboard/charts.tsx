"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

/* ---------------- shared tooltip ---------------- */

function TooltipBox({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; color?: string }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-popover-foreground">{title}</p>
      <div className="mt-1 space-y-0.5">
        {rows.map((r) => (
          <p key={r.label} className="flex items-center gap-2 text-muted-foreground">
            {r.color ? (
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: r.color }}
              />
            ) : null}
            <span>{r.label}</span>
            <span className="ml-auto font-medium text-popover-foreground">
              {r.value}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Sales chart (revenue OR orders, single axis) ---------------- */

type SalesPoint = { label: string; revenueCents: number; orders: number };

export function SalesChart({ points }: { points: SalesPoint[] }) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const isRevenue = metric === "revenue";
  const color = isRevenue ? "var(--chart-revenue)" : "var(--chart-orders)";
  const dataKey = isRevenue ? "revenueCents" : "orders";

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
          {(["revenue", "orders"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={cn(
                "rounded-md px-3 py-1 font-medium capitalize transition",
                metric === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--chart-grid)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickFormatter={(v: number) =>
                isRevenue
                  ? Intl.NumberFormat("en", { notation: "compact" }).format(v)
                  : String(v)
              }
            />
            <Tooltip
              cursor={{ stroke: "var(--chart-grid)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as SalesPoint;
                return (
                  <TooltipBox
                    title={String(label)}
                    rows={[
                      { label: "Revenue", value: formatPrice(p.revenueCents) },
                      { label: "Orders", value: String(p.orders) },
                    ]}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill="url(#salesFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------- Visitors chart (visitors OR page views) ---------------- */

type VisitorPoint = { label: string; views: number; visitors: number };

export function VisitorsChart({ points }: { points: VisitorPoint[] }) {
  const [metric, setMetric] = useState<"visitors" | "views">("visitors");
  const color = "var(--chart-visitors)";
  const dataKey = metric;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
          {(["visitors", "views"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={cn(
                "rounded-md px-3 py-1 font-medium capitalize transition",
                metric === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "visitors" ? "Visitors" : "Page views"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--chart-grid)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "var(--chart-grid)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as VisitorPoint;
                return (
                  <TooltipBox
                    title={String(label)}
                    rows={[
                      { label: "Visitors", value: String(p.visitors) },
                      { label: "Page views", value: String(p.views) },
                    ]}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill="url(#visitorsFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------- Order-status donut ---------------- */

type StatusSlice = { status: string; label: string; count: number };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--status-pending)",
  CONFIRMED: "var(--status-confirmed)",
  RECEIVED: "var(--status-completed)",
  CANCELLED: "var(--status-cancelled)",
};

export function OrderStatusChart({
  items,
  total,
}: {
  items: StatusSlice[];
  total: number;
}) {
  const data = items.filter((i) => i.count > 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.status} fill={STATUS_COLOR[d.status]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as StatusSlice;
                return (
                  <TooltipBox
                    title={p.label}
                    rows={[
                      { label: "Orders", value: String(p.count) },
                      {
                        label: "Share",
                        value: `${Math.round((p.count / total) * 100)}%`,
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{total}</p>
            <p className="text-[11px] text-muted-foreground">orders</p>
          </div>
        </div>
      </div>

      <ul className="w-full space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.status} className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: STATUS_COLOR[i.status] }}
            />
            <span className="text-muted-foreground">{i.label}</span>
            <span className="ml-auto font-semibold text-primary">{i.count}</span>
            <span className="w-10 text-right text-xs text-muted-foreground">
              {total > 0 ? Math.round((i.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Customer growth sparkline ---------------- */

export function GrowthSpark({
  points,
}: {
  points: { label: string; total: number }[];
}) {
  return (
    <div className="h-[64px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-revenue)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-revenue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <TooltipBox
                  title={String(label)}
                  rows={[
                    {
                      label: "Total customers",
                      value: String(payload[0].payload.total),
                    },
                  ]}
                />
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--chart-revenue)"
            strokeWidth={2}
            fill="url(#growthFill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
