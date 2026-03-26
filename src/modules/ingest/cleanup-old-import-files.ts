import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

export async function cleanupOldImportFiles() {
  const files = await readdir(env.REPORT_STORAGE_DIR).catch(() => []);
  const threshold = Date.now() - env.REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  for (const file of files) {
    const filePath = path.join(env.REPORT_STORAGE_DIR, file);
    const details = await stat(filePath);

    if (details.mtimeMs < threshold) {
      await rm(filePath, { force: true });
      deleted += 1;
    }
  }

  return deleted;
}
