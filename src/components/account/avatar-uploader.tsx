"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initialsFrom } from "@/components/account/avatar";
import { IconClose } from "@/components/icons";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";

export function AvatarUploader({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const t = useT();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    if (!viewing) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewing(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [viewing]);

  async function upload(file: File) {
    setPending("upload");
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/account/avatar", {
        method: "POST",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
        body,
      });
      const data = (await response.json()) as {
        avatarUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.avatarUrl) {
        setError(data.error ?? t.account.profile.uploadFailed);
        setPreview(avatarUrl);
        return;
      }

      setPreview(data.avatarUrl);
      router.refresh();
    } catch {
      setError(t.account.profile.networkError);
      setPreview(avatarUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setPending(null);
    }
  }

  async function remove() {
    setPending("remove");
    setError(null);
    try {
      const response = await fetch("/api/account/avatar", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? t.account.profile.photoRemoveError);
        return;
      }
      setPreview(null);
      setViewing(false);
      router.refresh();
    } catch {
      setError(t.account.profile.networkError);
    } finally {
      setPending(null);
    }
  }

  const avatarImage = preview ? (
    <Image
      src={preview}
      alt={name}
      fill
      sizes="64px"
      className="object-cover"
      unoptimized
    />
  ) : null;

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <button
          type="button"
          onClick={() => setViewing(true)}
          aria-label={t.account.profile.viewPhoto}
          className="group relative size-16 shrink-0 cursor-zoom-in overflow-hidden rounded-full bg-primary outline-none ring-offset-2 ring-offset-card focus-visible:ring-2 focus-visible:ring-ring"
        >
          {avatarImage}
          <span
            aria-hidden
            className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20"
          />
        </button>
      ) : (
        <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-primary">
          <span className="grid size-full place-items-center text-lg font-bold uppercase tracking-wide text-primary-foreground">
            {initialsFrom(name)}
          </span>
        </span>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending !== null}
            className="btn btn-outline"
          >
            {pending === "upload"
              ? t.account.profile.uploading
              : preview
                ? t.account.profile.changePhoto
                : t.account.profile.uploadPhoto}
          </button>
          {preview ? (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={pending !== null}
              className="text-sm underline underline-offset-4"
            >
              {pending === "remove"
                ? t.account.profile.removing
                : t.account.profile.removePhoto}
            </button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {t.account.profile.avatarHint}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void upload(file);
          }
        }}
      />

      <AnimatePresence>
        {viewing && preview ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={t.account.profile.viewPhoto}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setViewing(false);
              }
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onMouseDown={() => setViewing(false)}
            />

            <button
              type="button"
              onClick={() => setViewing(false)}
              aria-label={t.common.close}
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:bg-muted sm:right-5 sm:top-5"
            >
              <IconClose className="size-4" />
            </button>

            <motion.div
              className="relative h-[78vh] w-[86vw] max-w-2xl"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={
                reduce
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 320, damping: 28 }
              }
            >
              <Image
                src={preview}
                alt={name}
                fill
                sizes="86vw"
                className="rounded-2xl object-contain drop-shadow-2xl"
                unoptimized
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
