import { logger } from "@/lib/logger";
import { importMessage } from "@/modules/ingest/import-report-run";
import { listCandidateMessages } from "@/modules/ingest/gmail-client";

export async function triggerGmailImport() {
  const messages = await listCandidateMessages();
  const results = [];
  let failed = 0;

  for (const message of messages) {
    try {
      results.push(await importMessage(message));
    } catch (error) {
      failed += 1;
      logger.error("Import failed", {
        messageId: message.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    scanned: messages.length,
    processed: results.filter((result) => !result.skipped).length,
    skipped: results.filter((result) => result.skipped).length,
    failed
  };
}
