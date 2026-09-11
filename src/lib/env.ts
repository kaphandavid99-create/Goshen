const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

// Env values pasted into a dashboard often arrive wrapped in quotes or with a
// stray newline; strip those so keys like VAPID don't fail validation.
function readClean(name: string, fallback = "") {
  return (process.env[name] ?? fallback).trim().replace(/^["']|["']$/g, "");
}

function readNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3005",
  databaseUrl: process.env.DATABASE_URL,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "goshen_session",
  sessionMaxAgeSeconds: readNumber(
    "SESSION_MAX_AGE_SECONDS",
    DEFAULT_SESSION_MAX_AGE,
  ),
  csrfCookieName: "goshen_csrf",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  googleClientId: (process.env.GOOGLE_CLIENT_ID ?? "").trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET ?? "").trim(),
  groqApiKey: readClean("GROQ_API_KEY"),
  assistantModel: readClean("ASSISTANT_MODEL", "openai/gpt-oss-120b"),
  transcribeModel: readClean("ASSISTANT_TRANSCRIBE_MODEL", "whisper-large-v3-turbo"),
  vapidPublicKey: readClean("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
  vapidPrivateKey: readClean("VAPID_PRIVATE_KEY"),
  vapidSubject: readClean(
    "VAPID_SUBJECT",
    "mailto:kaphandavid99@gmail.com",
  ),

  // MTN MoMo Collections API. Sandbox and production share the same shape;
  // only the base URL, target environment and currency differ.
  momoEnv: readClean("MOMO_ENV", "sandbox"),
  momoBaseUrl: readClean(
    "MOMO_BASE_URL",
    "https://sandbox.momodeveloper.mtn.com",
  ),
  momoTargetEnvironment: readClean("MOMO_TARGET_ENVIRONMENT", "sandbox"),
  momoCollectionSubscriptionKey: readClean("MOMO_COLLECTION_SUBSCRIPTION_KEY"),
  momoCollectionApiUser: readClean("MOMO_COLLECTION_API_USER"),
  momoCollectionApiKey: readClean("MOMO_COLLECTION_API_KEY"),
  momoCurrency: readClean("MOMO_CURRENCY", "EUR"),
  momoCallbackUrl: readClean("MOMO_CALLBACK_URL"),

  // The only accounts allowed admin/staff access to /admin. Comma-separated,
  // case-insensitive. Anyone else is kept (or reset) to a regular customer —
  // see reconcileAdminAccess() in server/auth/current-user.ts.
  adminEmails: readClean(
    "ADMIN_EMAILS",
    "lemabrightness26@gmail.com,kaphandavid99@gmail.com",
  ),
};

export function isCloudinaryConfigured() {
  return Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  );
}

export function isGoogleAuthConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret);
}

export function isAssistantConfigured() {
  return Boolean(env.groqApiKey);
}

export function isPushConfigured() {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey);
}

export function isAllowedAdminEmail(email: string) {
  const allowed = env.adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function isMomoConfigured() {
  return Boolean(
    env.momoCollectionSubscriptionKey &&
      env.momoCollectionApiUser &&
      env.momoCollectionApiKey,
  );
}

export const isProduction = env.nodeEnv === "production";
