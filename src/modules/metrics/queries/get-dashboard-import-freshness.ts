import { stat } from "node:fs/promises";

import { pool } from "@/db/pool";

type LatestImportedRunRow = {
  databaseUpdatedAt: Date | string;
  reportReceivedAt: Date | string;
  filePath: string | null;
};

export type DashboardImportFreshness = {
  databaseUpdatedAt: string;
  sourceUpdatedAt: string;
  sourceUpdatedLabel: "CSV saved on server" | "Source report received";
};

export async function getDashboardImportFreshness(): Promise<DashboardImportFreshness | null> {
  const result = await pool.query<LatestImportedRunRow>(
    `
      select
        updated_at as "databaseUpdatedAt",
        report_received_at as "reportReceivedAt",
        file_path as "filePath"
      from import_runs
      where status = 'imported'
      order by updated_at desc
      limit 1
    `
  );

  const latestRun = result.rows[0];

  if (!latestRun) {
    return null;
  }

  const databaseUpdatedAt = toIsoString(latestRun.databaseUpdatedAt);
  const sourceTimestamp = await resolveSourceTimestamp(latestRun.filePath, latestRun.reportReceivedAt);

  if (!databaseUpdatedAt || !sourceTimestamp.updatedAt) {
    return null;
  }

  return {
    databaseUpdatedAt,
    sourceUpdatedAt: sourceTimestamp.updatedAt,
    sourceUpdatedLabel: sourceTimestamp.label
  };
}

async function resolveSourceTimestamp(
  filePath: string | null,
  reportReceivedAt: Date | string
) {
  if (filePath) {
    try {
      const details = await stat(filePath);

      return {
        updatedAt: details.mtime.toISOString(),
        label: "CSV saved on server" as const
      };
    } catch {
      // Fall back when the local CSV has already been cleaned up.
    }
  }

  return {
    updatedAt: toIsoString(reportReceivedAt),
    label: "Source report received" as const
  };
}

function toIsoString(value: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
