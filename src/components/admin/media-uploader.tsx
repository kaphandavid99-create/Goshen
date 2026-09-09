"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function readCsrf() {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  const data = (await response.json()) as { token?: string };
  return data.token ?? "";
}

export function MediaUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError("Choose an image or video.");
      return;
    }

    setPending(true);
    setError(null);
    setNote(null);

    try {
      const body = new FormData(form);
      const response = await fetch(`/api/admin/products/${productId}/media`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
        body,
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      form.reset();
      setNote(
        file.type.startsWith("video/")
          ? "Video saved to Cloudinary."
          : "Image uploaded. The background is being removed.",
      );
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
        <span className="font-medium">File</span>
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="field"
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Alt text</span>
        <input name="alt" type="text" className="field" placeholder="Product photo" />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Uploading…" : "Upload to Cloudinary"}
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

export function ClearAllImagesButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function clearAll() {
    setPending(true);
    setNote(null);
    try {
      const response = await fetch("/api/admin/products/clear-images", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      const data = (await response.json()) as { deleted?: number; error?: string };
      if (!response.ok) {
        setNote(data.error ?? "Could not clear images.");
        return;
      }
      setConfirming(false);
      setNote(`Removed ${data.deleted ?? 0} image${data.deleted === 1 ? "" : "s"}.`);
      router.refresh();
    } catch {
      setNote("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      {confirming ? (
        <>
          <button
            type="button"
            onClick={() => void clearAll()}
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? "Removing…" : "Yes, delete every image"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-outline"
        >
          Delete all product images
        </button>
      )}
      {note ? <span className="text-sm text-muted-foreground">{note}</span> : null}
    </span>
  );
}

export function DeleteMediaButton({
  productId,
  mediaId,
}: {
  productId: string;
  mediaId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await fetch(`/api/admin/products/${productId}/media/${mediaId}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void remove()}
      disabled={pending}
      className="btn btn-outline"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
