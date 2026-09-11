import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- KPI grid ---------------- */

export function StatGridSkeleton() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="card flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-6 w-24" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </section>
  );
}

/* ---------------- Section card ---------------- */

function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <section className="card flex min-w-0 flex-col p-5 sm:p-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </section>
  );
}

/* ---------------- Streamed analytics body ---------------- */

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="card flex min-w-0 flex-col p-5 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-56" />
        <Skeleton className="mt-4 h-56 w-full" />
      </section>

      <section className="card flex min-w-0 flex-col p-5 sm:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-56" />
        <Skeleton className="mt-4 h-56 w-full" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSkeleton lines={6} />
        <PanelSkeleton lines={6} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>

      <PanelSkeleton lines={3} />
      <PanelSkeleton lines={5} />
    </div>
  );
}
