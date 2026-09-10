"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { NIPZ_MAX_IMAGES } from "@/lib/constants";
import type { NipzContent, NipzImage } from "@/types/nipz";

type TextValues = {
  businessName: string;
  eyebrow: string;
  title: string;
  titleEm: string;
  lead: string;
  whatsappNumber: string;
};

export function NipzTextForm({ content }: { content: NipzContent }) {
  const router = useRouter();
  const [values, setValues] = useState<TextValues>({
    businessName: content.businessName,
    eyebrow: content.eyebrow,
    title: content.title,
    titleEm: content.titleEm,
    lead: content.lead,
    whatsappNumber: content.whatsappNumber,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function set<K extends keyof TextValues>(key: K, value: TextValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNote(null);

    try {
      const response = await fetch("/api/admin/nipz", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      setNote("Saved. The cakes page updates on the next load.");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Business name</span>
        <input
          className="field"
          value={values.businessName}
          onChange={(event) => set("businessName", event.target.value)}
          maxLength={80}
          required
        />
        <span className="text-xs text-muted-foreground">
          Shown in the shop banner, the page title and the WhatsApp message.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Heading</span>
          <input
            className="field"
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            maxLength={80}
            required
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">
            Heading accent{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <input
            className="field"
            value={values.titleEm}
            onChange={(event) => set("titleEm", event.target.value)}
            maxLength={60}
            placeholder="e.g. & Pastries"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Small line above the heading</span>
          <input
            className="field"
            value={values.eyebrow}
            onChange={(event) => set("eyebrow", event.target.value)}
            maxLength={80}
            required
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">WhatsApp number for orders</span>
          <input
            className="field"
            value={values.whatsappNumber}
            onChange={(event) => set("whatsappNumber", event.target.value)}
            inputMode="numeric"
            maxLength={18}
            required
            placeholder="237671283634"
          />
          <span className="text-xs text-muted-foreground">
            International format, digits only. Every &ldquo;Order on
            WhatsApp&rdquo; button opens a chat here.
          </span>
        </label>
      </div>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Details</span>
        <textarea
          className="field min-h-28"
          value={values.lead}
          onChange={(event) => set("lead", event.target.value)}
          maxLength={600}
          required
        />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save details"}
        </button>
        {error ? (
          <span role="alert" className="text-sm text-accent">
            {error}
          </span>
        ) : null}
        {note ? (
          <span className="text-sm text-muted-foreground">{note}</span>
        ) : null}
      </div>
    </form>
  );
}

export function NipzImageManager({
  images,
  configured,
}: {
  images: NipzImage[];
  configured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usingDefaults = images.every((image) => image.id.startsWith("default-"));
  const atMax = !usingDefaults && images.length >= NIPZ_MAX_IMAGES;

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput.files?.[0]) {
      setError("Choose an image.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/nipz/images", {
        method: "POST",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
        body: new FormData(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/nipz/images/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not remove this image.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        The cakes page shows a grid of up to {NIPZ_MAX_IMAGES} photos.{" "}
        {usingDefaults
          ? "These stock photos show until you upload your own."
          : `You have ${images.length} of ${NIPZ_MAX_IMAGES}.`}
      </p>

      {configured ? (
        atMax ? (
          <p className="text-sm text-muted-foreground">
            Remove one below to swap in a different photo.
          </p>
        ) : (
          <form onSubmit={(event) => void onUpload(event)} className="space-y-3">
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Add grid image</span>
              <input
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="field"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium">Alt text</span>
              <input
                name="alt"
                type="text"
                className="field"
                placeholder="What the photo shows"
              />
            </label>
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? "Uploading…" : "Upload image"}
            </button>
          </form>
        )
      ) : (
        <p className="text-sm text-accent">
          Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
          to .env, then restart the app.
        </p>
      )}

      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <li key={image.id} className="card overflow-hidden">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 20vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-2 p-3">
              <p className="text-xs text-muted-foreground">{image.alt}</p>
              {image.id.startsWith("default-") ? (
                <p className="text-xs text-muted-foreground">Stock photo</p>
              ) : (
                <button
                  type="button"
                  onClick={() => void remove(image.id)}
                  disabled={busyId === image.id}
                  className="btn btn-outline"
                >
                  {busyId === image.id ? "Removing…" : "Remove"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
