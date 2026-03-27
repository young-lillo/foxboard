import { readFile } from "node:fs/promises";

import { parse } from "csv-parse/sync";

import { COLUMN_ALIASES, REQUIRED_FIELDS } from "@/modules/ingest/csv-columns";
import { ReportRow } from "@/modules/ingest/types";
import { safeCpm, shouldCheckMetric } from "@/modules/metrics/formulas";

type CsvRecord = Record<string, string>;
type ResolvedColumns = Record<(typeof REQUIRED_FIELDS)[number], string>;

export async function parseReportCsv(filePath: string) {
  const input = await readFile(filePath, "utf8");
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CsvRecord[];

  const resolvedColumns = resolveColumns(records[0]);

  return records.map((record) => toReportRow(record, resolvedColumns));
}

function resolveColumns(record?: CsvRecord): ResolvedColumns {
  if (!record) {
    throw new Error("CSV is empty");
  }

  const keys = Object.keys(record);
  const resolved = {} as ResolvedColumns;

  for (const field of REQUIRED_FIELDS) {
    const match = COLUMN_ALIASES[field].find((candidate) => keys.includes(candidate));

    if (!match) {
      throw new Error(`Missing CSV column for ${field}`);
    }

    resolved[field] = match;
  }

  return resolved;
}

function toReportRow(record: CsvRecord, columns: ResolvedColumns): ReportRow {
  const impressions = toNumber(record[columns.impressions]);
  const bids = toNumber(record[columns.bids]);
  const totalBidAmounts = toNumber(record[columns.totalBidAmounts]);
  const mediaCost = toNumber(record[columns.mediaCost]);
  const bidCpm = safeCpm(totalBidAmounts, bids);
  const mediaCpm = safeCpm(mediaCost, impressions);

  return {
    metricDate: normalizeDate(record[columns.metricDate]),
    campaign: record[columns.campaign],
    adgroup: record[columns.adgroup],
    contract: record[columns.contract],
    impressions,
    bids,
    totalBidAmounts,
    mediaCost,
    bidCpm,
    mediaCpm,
    needsCheck: shouldCheckMetric(bidCpm, mediaCpm)
  };
}

function normalizeDate(value: string) {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (usMatch) {
    const month = usMatch[1].padStart(2, "0");
    const day = usMatch[2].padStart(2, "0");
    return `${usMatch[3]}-${month}-${day}`;
  }

  throw new Error(`Unsupported date format: ${value}`);
}

function toNumber(value: string) {
  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return parsed;
}
