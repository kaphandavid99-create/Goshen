"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.header
      className="max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h1 className="page-title">{title}</h1>
      {children ? (
        <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
      ) : null}
    </motion.header>
  );
}
