const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

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
  geminiApiKey: (process.env.GEMINI_API_KEY ?? "").trim(),
  assistantModel: (process.env.ASSISTANT_MODEL ?? "gemini-2.5-flash").trim(),
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
  return Boolean(env.geminiApiKey);
}

export const isProduction = env.nodeEnv === "production";
