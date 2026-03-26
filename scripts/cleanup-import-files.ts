import { cleanupOldImportFiles } from "@/modules/ingest/cleanup-old-import-files";

async function main() {
  const deleted = await cleanupOldImportFiles();
  process.stdout.write(`Deleted ${deleted} files\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
