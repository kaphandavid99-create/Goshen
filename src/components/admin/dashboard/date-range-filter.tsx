"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
] as const;

export function DateRangeFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = params.get("range") ?? "30d";
  const isCustom = current.startsWith("custom");
  const [, cFrom = "", cTo = ""] = isCustom ? current.split(":") : [];
  const [from, setFrom] = useState(cFrom);
  const [to, setTo] = useState(cTo);
  const [showCustom, setShowCustom] = useState(isCustom);

  function apply(range: string) {
    startTransition(() => {
      const next = new URLSearchParams(params);
      if (range === "30d") next.delete("range");
      else next.set("range", range);
      router.push(`/admin?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          aria-label="Date range"
          className="h-9 w-[11.5rem] cursor-pointer appearance-none rounded-xl border border-border bg-card py-0 pl-8 pr-9 text-sm font-medium leading-9 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={isCustom ? "custom" : current}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setShowCustom(true);
            } else {
              setShowCustom(false);
              apply(e.target.value);
            }
          }}
        >
          {PRESETS.map((p) => (
            <option
              key={p.value}
              value={p.value}
              className="bg-card text-foreground"
            >
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {showCustom ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="From date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 w-[9.5rem] rounded-xl border border-border bg-card px-3 py-0 text-sm leading-9 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            aria-label="To date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 w-[9.5rem] rounded-xl border border-border bg-card px-3 py-0 text-sm leading-9 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            disabled={!from || !to || pending}
            onClick={() => apply(`custom:${from}:${to}`)}
            className="btn btn-primary h-9 px-3 py-0 text-sm"
          >
            Apply
          </button>
        </div>
      ) : null}

      {pending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
