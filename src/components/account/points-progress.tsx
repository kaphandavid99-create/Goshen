"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IconStar } from "@/components/icons";

/**
 * A repeating fill bar: it tracks progress within the current 0..milestone
 * block, so the bar keeps giving customers a fresh target to chase (every
 * `milestone` points) instead of going stale once they cross the redeem
 * threshold once.
 */
export function PointsProgress({
  points,
  milestone,
  pointsLabel,
  readyLabel,
  lockedLabel,
  caption,
  ready,
}: {
  points: number;
  milestone: number;
  pointsLabel: string;
  readyLabel: string;
  lockedLabel: string;
  caption: string;
  ready: boolean;
}) {
  const reduce = useReducedMotion();
  const remainder = points % milestone;
  const progressInBlock = points > 0 && remainder === 0 ? milestone : remainder;
  const percent = Math.min(100, Math.max(0, (progressInBlock / milestone) * 100));
  const isFull = percent >= 100;

  return (
    <div className="rewards-progress">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-3xl font-bold tracking-tight text-primary">{pointsLabel}</span>
        <span className={`rewards-progress-badge${ready ? "" : " is-locked"}`}>
          <IconStar className="size-3.5" />
          {ready ? readyLabel : lockedLabel}
        </span>
      </div>

      <div
        className="rewards-progress-track"
        role="progressbar"
        aria-valuenow={progressInBlock}
        aria-valuemin={0}
        aria-valuemax={milestone}
      >
        <motion.div
          className={`rewards-progress-fill${isFull ? " is-complete" : ""}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
    </div>
  );
}
