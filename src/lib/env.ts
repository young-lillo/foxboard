import path from "node:path";

import { z } from "zod";

declare global {
  var __foxboardEnvWarningShown: boolean | undefined;
}

const allowFallbackDefaults =
  process.env.FOXBOARD_ALLOW_ENV_DEFAULTS === "1" || process.env.NODE_ENV === "test";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  ALLOWED_EMAIL_DOMAIN: z.string().min(1),
  GMAIL_USER: z.string().email(),
  GMAIL_QUERY: z.string().min(1),
  REPORT_STORAGE_DIR: z.string().min(1),
  REPORT_RETENTION_DAYS: z.coerce.number().int().min(1).max(30).default(3),
  REPORT_HOST_ALLOWLIST: z.string().min(1)
});

const rawEnv = allowFallbackDefaults
  ? {
      APP_URL: "http://localhost:3000",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/foxboard",
      AUTH_SECRET: "replace-this-secret-in-production",
      GOOGLE_CLIENT_ID: "replace-google-client-id",
      GOOGLE_CLIENT_SECRET: "replace-google-client-secret",
      GOOGLE_REFRESH_TOKEN: "replace-google-refresh-token",
      ALLOWED_EMAIL_DOMAIN: "example.com",
      GMAIL_USER: "reports@example.com",
      GMAIL_QUERY: "subject:(Daily Report)",
      REPORT_STORAGE_DIR: "./storage/imports",
      REPORT_HOST_ALLOWLIST: "desk.thetradedesk.com",
      ...process.env
    }
  : process.env;

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const fallbackWarnings = [
  "APP_URL",
  "DATABASE_URL",
  "AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "ALLOWED_EMAIL_DOMAIN",
  "GMAIL_USER",
  "GMAIL_QUERY",
  "REPORT_STORAGE_DIR",
  "REPORT_HOST_ALLOWLIST"
].filter((key) => !process.env[key]);

if (fallbackWarnings.length && allowFallbackDefaults && !global.__foxboardEnvWarningShown) {
  global.__foxboardEnvWarningShown = true;
  console.warn(`Using fallback env defaults for: ${fallbackWarnings.join(", ")}`);
}

export const env = {
  ...parsed.data,
  REPORT_STORAGE_DIR: path.resolve(process.cwd(), parsed.data.REPORT_STORAGE_DIR)
};
