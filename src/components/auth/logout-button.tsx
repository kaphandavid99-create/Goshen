"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/lib/i18n/context";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const t = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setPending(true);
    setError(null);

    try {
      const csrfResponse = await fetch("/api/auth/csrf", { cache: "no-store" });
      const csrfData = (await csrfResponse.json()) as { token?: string };

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "x-csrf-token": csrfData.token ?? "",
        },
      });

      if (!response.ok) {
        setError(t.account.signOutError);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to sign out. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void logout()}
        disabled={pending}
        className={className ?? "btn btn-outline"}
      >
        {pending ? t.account.signingOut : t.account.signOut}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
