import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { getStoragePath } from "@/modules/ingest/storage-path";

const MAX_REPORT_BYTES = 10 * 1024 * 1024;

export async function downloadReportFile(url: string, fileName: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.status}`);
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");

    if (contentLength > MAX_REPORT_BYTES) {
      throw new Error("Report exceeds maximum allowed size");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.byteLength > MAX_REPORT_BYTES) {
      throw new Error("Report exceeds maximum allowed size");
    }

    const filePath = await getStoragePath(fileName);
    await writeFile(filePath, buffer);

    return {
      fileHash: createHash("sha256").update(buffer).digest("hex"),
      filePath
    };
  } finally {
    clearTimeout(timeout);
  }
}
