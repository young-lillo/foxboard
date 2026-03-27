import { env } from "@/lib/env";

function getAllowedDomains() {
  return (process.env.ALLOWED_EMAIL_DOMAIN ?? env.ALLOWED_EMAIL_DOMAIN)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const domain = email.split("@")[1]?.toLowerCase();

  return domain ? getAllowedDomains().includes(domain) : false;
}
