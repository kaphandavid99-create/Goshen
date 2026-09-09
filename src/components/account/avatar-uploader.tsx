"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initialsFrom } from "@/components/account/avatar";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      router.refresh();
    } catch {
      setError(t.account.profile.networkError);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-primary">
        {preview ? (
          <Image
            src={preview}
            alt={name}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="grid size-full place-items-center text-lg font-bold uppercase tracking-wide text-primary-foreground">
            {initialsFrom(name)}
          </span>
        )}
      </span>

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
    </div>
  );
}
