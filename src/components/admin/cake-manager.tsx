"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { NIPZ } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import type { CakeItem } from "@/types/cakes";

export function CakeUploader({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  if (!configured) {
    return (
      <p className="text-sm text-accent">
        Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
        to .env, then restart the app.
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput.files?.[0]) {
      setError("Choose a photo.");
      return;
    }

    setPending(true);
    setError(null);
    setNote(null);
    try {
      const response = await fetch("/api/admin/cakes", {
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
      setNote("Added to the Nipz gallery.");
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
        <span className="font-medium">Photo</span>
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="field"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Name</span>
          <input name="name" type="text" className="field" required maxLength={120} />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Category</span>
          <select name="category" className="field" defaultValue={NIPZ.categories[0]}>
            {NIPZ.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          className="field min-h-20"
          required
          maxLength={600}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Starting price in FCFA (optional)</span>
          <input name="price" inputMode="numeric" className="field" placeholder="18000" />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Price note (optional)</span>
          <input
            name="priceNote"
            type="text"
            className="field"
            placeholder="from / Quote on request"
            maxLength={40}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="featured" type="checkbox" className="size-4" />
        <span className="font-medium">Mark as a signature item</span>
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Uploading…" : "Add to gallery"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </form>
  );
}

export function CakeItemList({ items }: { items: CakeItem[] }) {
  if (items.length === 0) {
    return (
      <p className="card p-5 text-sm text-muted-foreground">
        No gallery items yet. The public page shows sample photos until you add
        real ones.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <CakeItemCard key={item.id} item={item} />
      ))}
    </ul>
  );
}

function CakeItemCard({ item }: { item: CakeItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [featured, setFeatured] = useState(item.featured);
  const [available, setAvailable] = useState(item.available);
  const sample = item.id.startsWith("sample-");

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cakes/${item.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not save.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cakes/${item.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
        body: new FormData(form),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not save.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove "${item.name}" from the gallery?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cakes/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Could not remove.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li className="card overflow-hidden">
        <form onSubmit={(event) => void onSaveEdit(event)} className="space-y-3 p-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 20vw, 45vw"
              className="object-cover"
            />
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Replace photo (optional)</span>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="field"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              type="text"
              className="field"
              defaultValue={item.name}
              required
              maxLength={120}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Category</span>
            <select name="category" className="field" defaultValue={item.category}>
              {NIPZ.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              name="description"
              className="field min-h-20"
              defaultValue={item.description}
              required
              maxLength={600}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Starting price in FCFA</span>
              <input
                name="price"
                inputMode="numeric"
                className="field"
                defaultValue={item.priceCents != null ? String(item.priceCents) : ""}
                placeholder="18000"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Price note</span>
              <input
                name="priceNote"
                type="text"
                className="field"
                defaultValue={item.priceNote ?? ""}
                placeholder="from / Quote on request"
                maxLength={40}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />
              <span className="font-medium">Signature item</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4"
                checked={available}
                onChange={(event) => setAvailable(event.target.checked)}
              />
              <span className="font-medium">Visible on the public page</span>
            </label>
          </div>
          <input type="hidden" name="featured" value={featured ? "true" : "false"} />
          <input type="hidden" name="available" value={available ? "true" : "false"} />
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
          {error ? <p className="text-xs text-accent">{error}</p> : null}
        </form>
      </li>
    );
  }

  return (
    <li className="card overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(min-width: 1280px) 20vw, 45vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {item.category}
        </p>
        <p className="text-sm font-semibold text-primary">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.priceCents != null
            ? `${item.priceNote ? `${item.priceNote} ` : ""}${formatPrice(item.priceCents)}`
            : item.priceNote || "Price on request"}
        </p>

        {sample ? (
          <p className="text-xs text-muted-foreground">
            Built-in sample — add your own photo to replace the set.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ available: !item.available })}
              className="btn btn-outline"
            >
              {item.available ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch({ featured: !item.featured })}
              className="btn btn-outline"
            >
              {item.featured ? "Unfeature" : "Feature"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void remove()}
              className="btn btn-outline"
            >
              Delete
            </button>
          </div>
        )}
        {error ? <p className="text-xs text-accent">{error}</p> : null}
      </div>
    </li>
  );
}
