"use client";

export function PrintReceiptButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-outline no-print"
    >
      {label}
    </button>
  );
}
