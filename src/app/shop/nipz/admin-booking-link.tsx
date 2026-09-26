"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@/components/icons";

export function AdminBookingLink() {
  const [copied, setCopied] = useState(false);

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/shop/nipz#gallery`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <p className="mb-3 text-sm font-semibold text-amber-900">Admin: Shareable Booking Link</p>
      <p className="mb-4 text-sm text-amber-800">
        Copy and share this link with customers to show them the cake gallery where they can browse products and make a booking.
      </p>
      <div className="flex items-center gap-2 rounded bg-white p-3">
        <code className="flex-1 overflow-x-auto text-xs text-gray-700">{bookingUrl}</code>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 rounded bg-amber-600 p-2 text-white transition hover:bg-amber-700"
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
        </button>
      </div>
    </div>
  );
}
