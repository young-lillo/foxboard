import { env } from "@/lib/env";

const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;

export function extractReportLink(body: string) {
  const matches = body.match(URL_REGEX) ?? [];
  const allowlist = env.REPORT_HOST_ALLOWLIST.split(",").map((value) =>
    value.trim().toLowerCase()
  );

  for (const candidate of matches) {
    try {
      const url = new URL(candidate);

      if (url.protocol === "https:" && allowlist.includes(url.hostname.toLowerCase())) {
        return url.toString();
      }
    } catch {
      continue;
    }
  }

  throw new Error("No allowed report link found in email body");
}
