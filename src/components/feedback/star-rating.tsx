"use client";

import { useState } from "react";
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
      className="text-sm font-semibold tracking-wide"
      aria-label={t.rating.outOf(rounded, max)}
    >
      <span className="text-star">{"★".repeat(rounded)}</span>
      <span className="text-muted-foreground">{"★".repeat(max - rounded)}</span>
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
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={t.rating.label}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          name={name}
          onClick={() => onChange(score)}
          onMouseEnter={() => setHover(score)}
          onFocus={() => setHover(score)}
          onBlur={() => setHover(0)}
          className={`text-xl leading-none transition-colors ${
            score <= active ? "text-star" : "text-muted-foreground"
          }`}
          aria-pressed={score <= value}
          aria-label={t.rating.nStars(score)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
