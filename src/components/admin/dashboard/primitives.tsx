import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Delta pill (period-over-period %) ---------------- */

export function Delta({
  value,
  suffix = "vs previous period",
  className,
}: {
  value: number | null;
  suffix?: string;
  className?: string;
}) {
  if (value === null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        No prior data
      </span>
    );
  }

  const rounded = Math.round(value * 10) / 10;
  const flat = Math.abs(rounded) < 0.05;
  const up = rounded > 0;
  const Icon = flat ? null : up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        flat
          ? "text-muted-foreground"
          : up
            ? "text-[var(--delta-up)]"
            : "text-[var(--delta-down)]",
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {flat ? "0%" : `${up ? "+" : ""}${rounded}%`}
      <span className="font-normal text-muted-foreground">{suffix}</span>
    </span>
  );
}

/* ---------------- Stat card ---------------- */

export type StatCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  delta?: number | null;
  deltaSuffix?: string;
  sub?: ReactNode;
  href?: string;
  tone?: "default" | "warn" | "danger";
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaSuffix,
  sub,
  href,
  tone = "default",
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            tone === "danger"
              ? "bg-[var(--delta-down)]/12 text-[var(--delta-down)]"
              : tone === "warn"
                ? "bg-[var(--status-pending)]/15 text-[var(--status-pending)]"
                : "bg-muted text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-primary sm:text-2xl">
        {value}
      </p>
      {delta !== undefined ? (
        <div className="mt-1.5">
          <Delta value={delta ?? null} suffix={deltaSuffix ?? "vs previous"} />
        </div>
      ) : null}
      {sub ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      ) : null}
      {href ? (
        <ArrowUpRight className="absolute right-4 top-4 size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      ) : null}
    </>
  );

  const base =
    "card relative flex flex-col p-4 transition sm:p-5";

  return href ? (
    <Link href={href} className={cn(base, "group hover:border-primary/40")}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {children}
    </section>
  );
}

/* ---------------- Section container ---------------- */

export function DashboardSection({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  bodyClassName,
  accent = false,
  children,
  empty,
  isEmpty = false,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  bodyClassName?: string;
  accent?: boolean;
  children: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
}) {
  return (
    <section
      className={cn(
        "card flex min-w-0 flex-col p-5 sm:p-6",
        accent && "border-[var(--status-pending)]/40",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {actionLabel}
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : null}
      </div>

      <div className={cn("mt-4 min-w-0 flex-1", bodyClassName)}>
        {isEmpty ? (
          <EmptyState>{empty ?? "No data available yet."}</EmptyState>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/* ---------------- Small stat row (used inside panels) ---------------- */

export function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold text-primary">{value}</p>
      {sub ? <p className="text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
