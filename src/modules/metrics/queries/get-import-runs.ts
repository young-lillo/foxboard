import { pool } from "@/db/pool";

export async function getImportRuns(limit = 20) {
  const result = await pool.query(
    `
      select
        id,
        gmail_message_id as "gmailMessageId",
        source_url as "sourceUrl",
        source_host as "sourceHost",
        file_hash as "fileHash",
        file_path as "filePath",
        report_received_at as "reportReceivedAt",
        status,
        row_count as "rowCount",
        imported_row_count as "importedRowCount",
        error_message as "errorMessage",
        created_at as "createdAt"
      from import_runs
      order by created_at desc
      limit $1
    `,
    [limit]
  );

  return result.rows;
}
