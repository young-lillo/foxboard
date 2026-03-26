import { triggerGmailImport } from "@/modules/ingest/trigger-gmail-import";

async function main() {
  const result = await triggerGmailImport();
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
