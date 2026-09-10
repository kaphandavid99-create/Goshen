/**
 * Mints a MoMo sandbox API user + API key from your Collections subscription key.
 *
 *   1. Put your Primary Key in .env as MOMO_COLLECTION_SUBSCRIPTION_KEY
 *   2. node scripts/momo-provision.mjs
 *   3. Copy the printed MOMO_COLLECTION_API_USER / MOMO_COLLECTION_API_KEY into .env
 *
 * Sandbox only. In production MTN gives you all three values directly.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

function envValue(name) {
  if (process.env[name]) return process.env[name].trim();
  try {
    const line = readFileSync(new URL("../.env", import.meta.url), "utf8")
      .split("\n")
      .find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

const BASE = envValue("MOMO_BASE_URL") || "https://sandbox.momodeveloper.mtn.com";
const SUB_KEY = envValue("MOMO_COLLECTION_SUBSCRIPTION_KEY");
const CALLBACK_HOST =
  (envValue("MOMO_CALLBACK_URL") || "https://example.com").replace(/^https?:\/\//, "").split("/")[0];

if (!SUB_KEY) {
  console.error("Set MOMO_COLLECTION_SUBSCRIPTION_KEY in .env first.");
  process.exit(1);
}

const apiUser = randomUUID();

async function main() {
  console.log(`Base:        ${BASE}`);
  console.log(`API user id: ${apiUser}`);
  console.log(`Callback:    ${CALLBACK_HOST}\n`);

  const created = await fetch(`${BASE}/v1_0/apiuser`, {
    method: "POST",
    headers: {
      "X-Reference-Id": apiUser,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerCallbackHost: CALLBACK_HOST }),
  });
  if (created.status !== 201) {
    console.error(`Create API user failed (${created.status}): ${await created.text()}`);
    process.exit(1);
  }
  console.log("API user created.");

  const keyRes = await fetch(`${BASE}/v1_0/apiuser/${apiUser}/apikey`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": SUB_KEY },
  });
  if (keyRes.status !== 201) {
    console.error(`Create API key failed (${keyRes.status}): ${await keyRes.text()}`);
    process.exit(1);
  }
  const { apiKey } = await keyRes.json();

  console.log("\nAdd these to .env:\n");
  console.log(`MOMO_COLLECTION_API_USER="${apiUser}"`);
  console.log(`MOMO_COLLECTION_API_KEY="${apiKey}"`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
