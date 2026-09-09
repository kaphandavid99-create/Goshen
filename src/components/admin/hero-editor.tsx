"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import type { HeroContent, HeroImage } from "@/types/hero";

type TextValues = Omit<HeroContent, "images" | "rotatingLines"> & {
  rotatingLines: string[];
};

export function HeroTextForm({ content }: { content: HeroContent }) {
  const router = useRouter();
  const [values, setValues] = useState<TextValues>({
    kicker: content.kicker,
    headline: content.headline,
    rotatingLines: content.rotatingLines,
    lead: content.lead,
    primaryCtaLabel: content.primaryCtaLabel,
    primaryCtaHref: content.primaryCtaHref,
    secondaryCtaLabel: content.secondaryCtaLabel,
    secondaryCtaHref: content.secondaryCtaHref,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function set<K extends keyof TextValues>(key: K, value: TextValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function setLine(index: number, value: string) {
    setValues((current) => ({
      ...current,
      rotatingLines: current.rotatingLines.map((line, i) =>
        i === index ? value : line,
      ),
    }));
  }

  function addLine() {
    setValues((current) =>
      current.rotatingLines.length >= 6
        ? current
        : { ...current, rotatingLines: [...current.rotatingLines, ""] },
    );
  }

  function removeLine(index: number) {
    setValues((current) => ({
      ...current,
      rotatingLines: current.rotatingLines.filter((_, i) => i !== index),
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNote(null);

    try {
      const response = await fetch("/api/admin/hero", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({
          ...values,
          rotatingLines: values.rotatingLines
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      setNote("Saved. The homepage updates on the next load.");
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
        <span className="font-medium">Kicker</span>
        <input
          className="field"
          value={values.kicker}
          onChange={(event) => set("kicker", event.target.value)}
          maxLength={80}
          required
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Headline (fixed first line)</span>
        <input
          className="field"
          value={values.headline}
          onChange={(event) => set("headline", event.target.value)}
          maxLength={120}
          required
        />
      </label>

      <div className="space-y-2 text-sm">
        <span className="font-medium">Rotating lines</span>
        <p className="text-xs text-muted-foreground">
          These cycle under the headline, one after another.
        </p>
        <div className="space-y-2">
          {values.rotatingLines.map((line, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="field"
                value={line}
                onChange={(event) => setLine(index, event.target.value)}
                maxLength={120}
                placeholder={`Line ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeLine(index)}
                disabled={values.rotatingLines.length <= 1}
                className="btn btn-outline shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {values.rotatingLines.length < 6 ? (
          <button type="button" onClick={addLine} className="btn-ghost text-sm">
            Add line
          </button>
        ) : null}
      </div>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Lead paragraph</span>
        <textarea
          className="field min-h-24"
          value={values.lead}
          onChange={(event) => set("lead", event.target.value)}
          maxLength={400}
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Primary button label</span>
          <input
            className="field"
            value={values.primaryCtaLabel}
            onChange={(event) => set("primaryCtaLabel", event.target.value)}
            maxLength={40}
            required
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Primary button link</span>
          <input
            className="field"
            value={values.primaryCtaHref}
            onChange={(event) => set("primaryCtaHref", event.target.value)}
            maxLength={200}
            required
            placeholder="/shop"
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Secondary button label</span>
          <input
            className="field"
            value={values.secondaryCtaLabel}
            onChange={(event) => set("secondaryCtaLabel", event.target.value)}
            maxLength={40}
            required
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Secondary button link</span>
          <input
            className="field"
            value={values.secondaryCtaHref}
            onChange={(event) => set("secondaryCtaHref", event.target.value)}
            maxLength={200}
            required
            placeholder="/shop?deals=1"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save hero text"}
        </button>
        {error ? (
          <span role="alert" className="text-sm text-accent">
            {error}
          </span>
        ) : null}
        {note ? <span className="text-sm text-muted-foreground">{note}</span> : null}
      </div>
    </form>
  );
}

export function HeroImageManager({
  images,
  configured,
}: {
  images: HeroImage[];
  configured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usingDefault = images.length === 1 && images[0].id === "default";

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
      const response = await fetch("/api/admin/hero/images", {
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
      const response = await fetch(`/api/admin/hero/images/${id}`, {
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
      {configured ? (
        <form onSubmit={(event) => void onUpload(event)} className="space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Add image</span>
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
              placeholder="What the image shows"
            />
          </label>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Uploading…" : "Upload image"}
          </button>
        </form>
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

      {usingDefault ? (
        <p className="text-sm text-muted-foreground">
          Showing the built-in image. Upload one to replace it.
        </p>
      ) : null}

      {images.length > 1 ? (
        <p className="text-sm text-muted-foreground">
          The hero fades through these images in order.
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
              {image.id === "default" ? (
                <p className="text-xs text-muted-foreground">Built-in</p>
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
