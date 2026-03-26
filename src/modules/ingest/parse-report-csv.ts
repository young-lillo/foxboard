import { readFile } from "node:fs/promises";

import { parse } from "csv-parse/sync";

import { REQUIRED_COLUMNS } from "@/modules/ingest/csv-columns";
import { ReportRow } from "@/modules/ingest/types";
import { safeCpm, shouldCheckMetric } from "@/modules/metrics/formulas";

type CsvRecord = Record<string, string>;

export async function parseReportCsv(filePath: string) {
  const input = await readFile(filePath, "utf8");
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CsvRecord[];

  validateHeaders(records[0]);

  return records.map(toReportRow);
}

function validateHeaders(record?: CsvRecord) {
  if (!record) {
    throw new Error("CSV is empty");
  }

  const keys = Object.keys(record);

  for (const column of REQUIRED_COLUMNS) {
    if (!keys.includes(column)) {
      throw new Error(`Missing CSV column: ${column}`);
    }
  }
}

function toReportRow(record: CsvRecord): ReportRow {
  const impressions = toNumber(record["Impressions"]);
  const bids = toNumber(record["Bids"]);
  const totalBidAmounts = toNumber(record["Total Bid Amounts"]);
  const mediaCost = toNumber(record["Media Cost"]);
  const bidCpm = safeCpm(totalBidAmounts, bids);
  const mediaCpm = safeCpm(mediaCost, impressions);

  return {
    metricDate: normalizeDate(record["Date"]),
    campaign: record["Campaign"],
    adgroup: record["Adgroup"],
    contract: record["Contract"],
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
