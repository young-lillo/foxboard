import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { parseReportCsv } from "@/modules/ingest/parse-report-csv";

describe("parseReportCsv", () => {
  it("parses rows and computes metrics", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "foxboard-"));
    const filePath = path.join(dir, "report.csv");

    await writeFile(
      filePath,
      [
        "Date,Campaign,Adgroup,Contract,Impressions,Bids,Total Bid Amounts,Media Cost",
        "2026-03-25,Camp A,Ad A,Contract A,1000,500,750,1000"
      ].join("\n")
    );

    const rows = await parseReportCsv(filePath);

    expect(rows).toHaveLength(1);
    expect(rows[0].bidCpm).toBe(1500);
    expect(rows[0].mediaCpm).toBe(1000);
    expect(rows[0].needsCheck).toBe(false);
  });
});
