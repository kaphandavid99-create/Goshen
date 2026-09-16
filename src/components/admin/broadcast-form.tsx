"use client";

import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";

type Audience = "ALL_CUSTOMERS" | "WHOLESALE_CUSTOMERS";

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "ALL_CUSTOMERS", label: "All customers" },
  { value: "WHOLESALE_CUSTOMERS", label: "Approved wholesale customers only" },
];

export function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [href, setHref] = useState("");
  const [audience, setAudience] = useState<Audience>("ALL_CUSTOMERS");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNote(null);

    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({
          title,
          body,
          href: href.trim() || undefined,
          audience,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        recipientCount?: number;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not send the broadcast.");
        return;
      }

      setNote(
        `Sent to ${data.recipientCount ?? 0} customer${data.recipientCount === 1 ? "" : "s"}.`,
      );
      setTitle("");
      setBody("");
      setHref("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Title</span>
        <input
          className="field"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="20% off this weekend"
          maxLength={80}
          required
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          className="field min-h-24"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="All drinks and snacks are 20% off, this Saturday and Sunday only."
          maxLength={300}
          required
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Link (optional)</span>
        <input
          className="field"
          value={href}
          onChange={(event) => setHref(event.target.value)}
          placeholder="/shop?deals=1"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          Where tapping the notification should open. Leave blank to send
          people to their notifications list.
        </p>
      </label>

      <label className="block space-y-2 text-sm">
        <span className="font-medium">Send to</span>
        <select
          className="field"
          value={audience}
          onChange={(event) => setAudience(event.target.value as Audience)}
        >
          {AUDIENCES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Sending…" : "Send broadcast"}
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
