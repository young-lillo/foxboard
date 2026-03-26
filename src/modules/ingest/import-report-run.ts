import { randomUUID } from "node:crypto";
import path from "node:path";

import { pool } from "@/db/pool";
import { logger } from "@/lib/logger";
import { downloadReportFile } from "@/modules/ingest/download-report-file";
import { extractReportLink } from "@/modules/ingest/extract-report-link";
import { parseReportCsv } from "@/modules/ingest/parse-report-csv";
import { GmailMessage } from "@/modules/ingest/types";

export async function importMessage(message: GmailMessage) {
  const sourceUrl = extractReportLink(message.body);
  const fileName = `${message.id}.csv`;
  const importRunId = randomUUID();
  const inserted = await pool.query<{ id: string }>(
    `
      insert into import_runs (
        id,
        gmail_message_id,
        gmail_thread_id,
        source_url,
        source_host,
        file_hash,
        file_path,
        report_received_at,
        status
      )
      values ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8 / 1000.0), 'pending')
      on conflict (gmail_message_id) do nothing
      returning id
    `,
    [
      importRunId,
      message.id,
      message.threadId,
      sourceUrl,
      new URL(sourceUrl).hostname,
      "",
      null,
      message.internalDate
    ]
  );

  if (!inserted.rowCount) {
    logger.info("Skipping existing import run", { messageId: message.id });
    return { skipped: true };
  }

  const { fileHash, filePath } = await downloadReportFile(sourceUrl, fileName);
  await pool.query(
    `
      update import_runs
      set file_hash = $2,
          file_path = $3,
          status = 'downloaded',
          updated_at = now()
      where id = $1
    `,
    [importRunId, fileHash, filePath]
  );

  let transactionStarted = false;
  const client = await pool.connect();

  try {
    const rows = await parseReportCsv(filePath);
    await client.query("begin");
    transactionStarted = true;

    for (const row of rows) {
      await client.query(
        `
          insert into campaign_daily_metrics (
            import_run_id,
            id,
            metric_date,
            campaign,
            adgroup,
            contract,
            impressions,
            bids,
            total_bid_amounts,
            media_cost,
            bid_cpm,
            media_cpm,
            needs_check,
            updated_at
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now()
          )
          on conflict (metric_date, campaign, adgroup, contract)
          do update set
            import_run_id = excluded.import_run_id,
            impressions = excluded.impressions,
            bids = excluded.bids,
            total_bid_amounts = excluded.total_bid_amounts,
            media_cost = excluded.media_cost,
            bid_cpm = excluded.bid_cpm,
            media_cpm = excluded.media_cpm,
            needs_check = excluded.needs_check,
            updated_at = now()
        `,
        [
          importRunId,
          randomUUID(),
          row.metricDate,
          row.campaign,
          row.adgroup,
          row.contract,
          row.impressions,
          row.bids,
          row.totalBidAmounts,
          row.mediaCost,
          row.bidCpm,
          row.mediaCpm,
          row.needsCheck
        ]
      );
    }

    await client.query(
      `
        update import_runs
        set status = 'imported',
            row_count = $2,
            imported_row_count = $2,
            updated_at = now()
        where id = $1
      `,
      [importRunId, rows.length]
    );

    await client.query("commit");

    return {
      skipped: false,
      fileName: path.basename(filePath),
      importRunId,
      rowCount: rows.length
    };
  } catch (error) {
    if (transactionStarted) {
      await client.query("rollback");
    }
    await pool.query(
      `
        update import_runs
        set status = 'failed',
            error_message = $2,
            updated_at = now()
        where id = $1
      `,
      [importRunId, error instanceof Error ? error.message : String(error)]
    );
    throw error;
  } finally {
    client.release();
  }
}
