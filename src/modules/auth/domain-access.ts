import { env } from "@/lib/env";

export function isAllowedEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const domain = email.split("@")[1]?.toLowerCase();

  return domain === env.ALLOWED_EMAIL_DOMAIN.toLowerCase();
}
