import "server-only";

import { env, isEmailConfigured } from "@/lib/env";

// Thin client for the Resend email API. No SDK — same "just fetch it"
// approach used for MoMo in server/payments/momo.ts.

export class EmailError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "EmailError";
    this.status = status;
  }
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!isEmailConfigured()) {
    throw new EmailError("Email is not configured on the server", 503);
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.receiptFromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new EmailError(
      `Resend request failed: ${text.slice(0, 300) || response.statusText}`,
      response.status,
    );
  }
}
