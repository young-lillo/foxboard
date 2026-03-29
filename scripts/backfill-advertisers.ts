import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";

import { pool } from "@/db/pool";
import { parseReportCsv } from "@/modules/ingest/parse-report-csv";

type ImportRunRow = {
  filePath: string;
};

type BackfillRow = {
  advertiser: string;
  adgroup: string;
  campaign: string;
  contract: string;
  metricDate: string;
};

type CountRow = {
  matchedRows: string;
  rowsToUpdate: string;
};

const INSERT_CHUNK_SIZE = 500;

async function main() {
  const apply = process.argv.includes("--apply");
  const importRuns = await getImportedFiles();
  const dedupedRows = await collectBackfillRows(importRuns);
  const result = await applyBackfill(dedupedRows, apply);

  process.stdout.write(
    `${JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        filesFound: importRuns.length,
        rowsPrepared: dedupedRows.length,
        matchedRows: result.matchedRows,
        rowsToUpdate: result.rowsToUpdate,
        rowsUpdated: apply ? result.rowsUpdated : 0
      },
      null,
      2
    )}\n`
  );
}

async function getImportedFiles() {
  const result = await pool.query<ImportRunRow>(
    `
      select file_path as "filePath"
      from import_runs
      where status = 'imported'
        and file_path is not null
      order by report_received_at desc, created_at desc
    `
  );

  return result.rows;
}

async function collectBackfillRows(importRuns: ImportRunRow[]) {
  const deduped = new Map<string, BackfillRow>();

  for (const run of importRuns) {
    if (!(await fileExists(run.filePath))) {
      continue;
    }

    const rows = await parseReportCsv(run.filePath);

    for (const row of rows) {
      if (row.advertiser === "-") {
        continue;
      }

      const key = buildKey(row.metricDate, row.campaign, row.adgroup, row.contract);

      if (deduped.has(key)) {
        continue;
      }

      deduped.set(key, {
        advertiser: row.advertiser,
        adgroup: row.adgroup,
        campaign: row.campaign,
        contract: row.contract,
        metricDate: row.metricDate
      });
    }
  }

  return [...deduped.values()];
}

async function applyBackfill(rows: BackfillRow[], apply: boolean) {
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      `
        create temporary table advertiser_backfill (
          metric_date date not null,
          campaign text not null,
          adgroup text not null,
          contract text not null,
          advertiser text not null
        ) on commit drop
      `
    );

    for (let index = 0; index < rows.length; index += INSERT_CHUNK_SIZE) {
      const chunk = rows.slice(index, index + INSERT_CHUNK_SIZE);
      const values: unknown[] = [];
      const placeholders = chunk.map((row, rowIndex) => {
        const offset = rowIndex * 5;
        values.push(
          row.metricDate,
          row.campaign,
          row.adgroup,
          row.contract,
          row.advertiser
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });

      await client.query(
        `
          insert into advertiser_backfill (
            metric_date,
            campaign,
            adgroup,
            contract,
            advertiser
          )
          values ${placeholders.join(", ")}
        `,
        values
      );
    }

    const counts = await client.query<CountRow>(
      `
        select
          count(*)::text as "matchedRows",
          count(*) filter (
            where campaign_daily_metrics.advertiser = '-'
          )::text as "rowsToUpdate"
        from campaign_daily_metrics
        join advertiser_backfill
          on advertiser_backfill.metric_date = campaign_daily_metrics.metric_date
         and advertiser_backfill.campaign = campaign_daily_metrics.campaign
         and advertiser_backfill.adgroup = campaign_daily_metrics.adgroup
         and advertiser_backfill.contract = campaign_daily_metrics.contract
      `
    );

    let rowsUpdated = 0;

    if (apply) {
      const updateResult = await client.query(
        `
          update campaign_daily_metrics
          set advertiser = advertiser_backfill.advertiser,
              updated_at = now()
          from advertiser_backfill
          where advertiser_backfill.metric_date = campaign_daily_metrics.metric_date
            and advertiser_backfill.campaign = campaign_daily_metrics.campaign
            and advertiser_backfill.adgroup = campaign_daily_metrics.adgroup
            and advertiser_backfill.contract = campaign_daily_metrics.contract
            and campaign_daily_metrics.advertiser = '-'
        `
      );
      rowsUpdated = updateResult.rowCount ?? 0;
    }

    await client.query(apply ? "commit" : "rollback");

    return {
      matchedRows: Number(counts.rows[0]?.matchedRows ?? 0),
      rowsToUpdate: Number(counts.rows[0]?.rowsToUpdate ?? 0),
      rowsUpdated
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function buildKey(
  metricDate: string,
  campaign: string,
  adgroup: string,
  contract: string
) {
  return [metricDate, campaign, adgroup, contract].join("\t");
}

async function fileExists(filePath: string) {
  try {
    await access(filePath, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
