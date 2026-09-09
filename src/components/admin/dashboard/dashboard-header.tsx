import Link from "next/link";
import { Bell, PackagePlus } from "lucide-react";
import { Avatar } from "@/components/account/avatar";
import { DateRangeFilter } from "@/components/admin/dashboard/date-range-filter";
import type { PublicUser } from "@/types";

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({
  user,
  alertCount,
}: {
  user: PublicUser;
  alertCount: number;
}) {
  const firstName = user.name.split(" ")[0];
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} url={user.avatarUrl} size={48} />
          <div>
            <p className="kicker">Dashboard</p>
            <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
              {greeting()}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders?status=PENDING"
            aria-label={`${alertCount} items need attention`}
            className="relative grid size-9 place-items-center rounded-lg border border-border text-primary transition hover:bg-muted"
          >
            <Bell className="size-4" />
            {alertCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/admin/products/new"
            className="btn btn-primary h-9 px-3 py-0 text-sm"
          >
            <PackagePlus className="size-4" />
            <span className="hidden sm:inline">Add product</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Showing store activity for the selected period
        </p>
        <DateRangeFilter />
      </div>
    </header>
  );
}
