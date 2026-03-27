import { env } from "@/lib/env";

export function applyAuthRuntimeEnv() {
  const canonicalUrl = env.APP_URL.replace(/\/$/, "");

  process.env.AUTH_URL = canonicalUrl;
  process.env.NEXTAUTH_URL = canonicalUrl;
  process.env.AUTH_TRUST_HOST ??= "true";
}
