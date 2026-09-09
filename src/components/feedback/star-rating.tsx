"use client";

import { useT } from "@/lib/i18n/context";

export function StarRating({
  value,
  max = 5,
}: {
  value: number;
  max?: number;
}) {
  const rounded = Math.max(0, Math.min(max, Math.round(value)));
  const t = useT();

  return (
    <p
      className="text-sm font-semibold tracking-wide text-accent"
      aria-label={t.rating.outOf(rounded, max)}
    >
      {"★".repeat(rounded)}
      {"☆".repeat(max - rounded)}
    </p>
  );
}

export function StarPicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t.rating.label}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          name={name}
          onClick={() => onChange(score)}
          className="text-xl leading-none text-accent"
          aria-pressed={score <= value}
          aria-label={t.rating.nStars(score)}
        >
          {score <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
