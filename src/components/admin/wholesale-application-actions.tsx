"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";

export function WholesaleApplicationActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
}) {
  const router = useRouter();
  const [pending, setPending] = useState<null | "APPROVED" | "REJECTED">(null);
  const [error, setError] = useState<string | null>(null);

  async function review(next: "APPROVED" | "REJECTED") {
    setPending(next);
    setError(null);
    try {
      const response = await fetch(`/api/admin/wholesale/${applicationId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to update.");
        return;
      }
      router.refresh();
    } catch {
      setError("Try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
        {status !== "APPROVED" ? (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => void review("APPROVED")}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-92 disabled:opacity-55"
          >
            {pending === "APPROVED" ? "Approving…" : "Approve"}
          </button>
        ) : null}
        {status !== "REJECTED" ? (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => void review("REJECTED")}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-55"
          >
            {pending === "REJECTED" ? "Rejecting…" : "Reject"}
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
