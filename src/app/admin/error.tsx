"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="kicker">Dashboard</p>
      <h1 className="page-title">Couldn&apos;t load this page</h1>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        The database took too long to respond. This is usually a brief hiccup on
        the connection — try again in a moment.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-2">
        Try again
      </button>
    </main>
  );
}
