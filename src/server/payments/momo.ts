import "server-only";

import { env, isMomoConfigured } from "@/lib/env";

// Thin client for the MTN MoMo Collections API. Sandbox and production speak the
// same protocol; the base URL, target-environment header and currency come from
// env. Amounts are whole currency units (FCFA has no minor unit).

export class MomoError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "MomoError";
    this.status = status;
  }
}

export type MomoStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

type CachedToken = { token: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

function baseUrl() {
  return env.momoBaseUrl.replace(/\/$/, "");
}

function subKeyHeader() {
  return { "Ocp-Apim-Subscription-Key": env.momoCollectionSubscriptionKey };
}

async function readError(response: Response) {
  const text = await response.text().catch(() => "");
  return text.slice(0, 300) || `${response.status} ${response.statusText}`;
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const basic = Buffer.from(
    `${env.momoCollectionApiUser}:${env.momoCollectionApiKey}`,
  ).toString("base64");

  const response = await fetch(`${baseUrl()}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      ...subKeyHeader(),
    },
  });

  if (!response.ok) {
    throw new MomoError(`MoMo token request failed: ${await readError(response)}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) {
    throw new MomoError("MoMo token response had no access_token");
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

async function authHeaders() {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "X-Target-Environment": env.momoTargetEnvironment,
    ...subKeyHeader(),
  };
}

// Ask the payer to approve a payment. Returns once MoMo has accepted the
// request (202); the payer then approves with their PIN and the outcome is
// read later via getRequestToPayStatus.
export async function requestToPay(input: {
  referenceId: string;
  amount: number;
  phone: string;
  externalId: string;
  payerMessage: string;
  payeeNote: string;
}) {
  if (!isMomoConfigured()) {
    throw new MomoError("MoMo is not configured on the server", 503);
  }

  const headers: Record<string, string> = {
    ...(await authHeaders()),
    "X-Reference-Id": input.referenceId,
    "Content-Type": "application/json",
  };
  if (env.momoCallbackUrl) {
    headers["X-Callback-Url"] = env.momoCallbackUrl;
  }

  const response = await fetch(`${baseUrl()}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: String(Math.round(input.amount)),
      currency: env.momoCurrency,
      externalId: input.externalId,
      payer: { partyIdType: "MSISDN", partyId: input.phone.replace(/\D/g, "") },
      payerMessage: input.payerMessage.slice(0, 160),
      payeeNote: input.payeeNote.slice(0, 160),
    }),
  });

  if (response.status !== 202) {
    throw new MomoError(
      `MoMo request-to-pay was rejected: ${await readError(response)}`,
      response.status === 400 ? 400 : 502,
    );
  }
}

export async function getRequestToPayStatus(referenceId: string): Promise<{
  status: MomoStatus;
  reason: string | null;
  financialTransactionId: string | null;
}> {
  if (!isMomoConfigured()) {
    throw new MomoError("MoMo is not configured on the server", 503);
  }

  const response = await fetch(
    `${baseUrl()}/collection/v1_0/requesttopay/${referenceId}`,
    { headers: await authHeaders() },
  );

  if (!response.ok) {
    throw new MomoError(
      `MoMo status check failed: ${await readError(response)}`,
      response.status === 404 ? 404 : 502,
    );
  }

  const data = (await response.json()) as {
    status?: string;
    reason?: string | { code?: string; message?: string };
    financialTransactionId?: string;
  };

  const status: MomoStatus =
    data.status === "SUCCESSFUL"
      ? "SUCCESSFUL"
      : data.status === "FAILED"
        ? "FAILED"
        : "PENDING";

  const reason =
    typeof data.reason === "string"
      ? data.reason
      : (data.reason?.message ?? data.reason?.code ?? null);

  return {
    status,
    reason,
    financialTransactionId: data.financialTransactionId ?? null,
  };
}
