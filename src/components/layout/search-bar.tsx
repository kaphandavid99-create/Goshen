"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { IconClose, IconSearch } from "@/components/icons";
import { useT } from "@/lib/i18n/context";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const t = useT();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 70);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.search.productsLabel}
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-full text-primary transition hover:bg-muted"
      >
        <IconSearch className="size-5" strokeWidth={2.2} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-24 sm:pt-32"
            role="dialog"
            aria-modal="true"
            aria-label={t.search.dialogLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setOpen(false);
              }
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onMouseDown={() => setOpen(false)}
            />

            <motion.form
              action="/shop"
              role="search"
              className="relative w-full max-w-xl"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -32, scale: 0.94, filter: "blur(8px)" }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -22, scale: 0.96, filter: "blur(6px)" }
              }
              transition={
                reduce
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 320, damping: 26, mass: 0.9 }
              }
            >
              <span
                aria-hidden
                className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-accent/60 via-primary/40 to-accent/60 blur-2xl"
              />

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5">
                <div className="flex items-center gap-3 px-4">
                  <IconSearch
                    className="size-5 shrink-0 text-primary"
                    strokeWidth={2.2}
                  />
                  <input
                    ref={inputRef}
                    name="q"
                    type="search"
                    autoComplete="off"
                    aria-label={t.search.productsLabel}
                    placeholder={t.header.searchPlaceholder}
                    className="h-16 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t.search.close}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <IconClose className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
                  <span>{t.search.catalogue}</span>
                  <span className="hidden items-center gap-1.5 sm:flex">
                    <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-medium text-foreground">
                      {t.search.enter}
                    </kbd>
                    {t.search.toSearch}
                    <kbd className="ml-2 rounded border border-border bg-card px-1.5 py-0.5 font-medium text-foreground">
                      {t.search.esc}
                    </kbd>
                    {t.search.toClose}
                  </span>
                </div>
              </div>

              <button type="submit" className="sr-only">
                {t.search.submit}
              </button>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
