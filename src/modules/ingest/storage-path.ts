import { mkdir } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

export async function ensureStorageDir() {
  await mkdir(env.REPORT_STORAGE_DIR, { recursive: true });
  return env.REPORT_STORAGE_DIR;
}

export async function getStoragePath(fileName: string) {
  const dir = await ensureStorageDir();
  return path.join(dir, fileName);
}
