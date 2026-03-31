import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();
const statMock = vi.fn();

vi.mock("@/db/pool", () => ({
  pool: {
    query: queryMock
  }
}));

vi.mock("node:fs/promises", () => ({
  stat: statMock
}));

describe("getDashboardImportFreshness", () => {
  beforeEach(() => {
    queryMock.mockReset();
    statMock.mockReset();
  });

  it("returns null when there is no imported run", async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const { getDashboardImportFreshness } = await import(
      "@/modules/metrics/queries/get-dashboard-import-freshness"
    );
    const freshness = await getDashboardImportFreshness();

    expect(freshness).toBeNull();
    expect(statMock).not.toHaveBeenCalled();
  });

  it("uses the local CSV mtime when the file exists", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          databaseUpdatedAt: new Date("2026-03-31T09:02:00.000Z"),
          reportReceivedAt: new Date("2026-03-31T09:00:00.000Z"),
          filePath: "/opt/foxboard/storage/imports/report.csv"
        }
      ]
    });
    statMock.mockResolvedValue({
      mtime: new Date("2026-03-31T09:01:00.000Z")
    });

    const { getDashboardImportFreshness } = await import(
      "@/modules/metrics/queries/get-dashboard-import-freshness"
    );
    const freshness = await getDashboardImportFreshness();

    expect(freshness).toEqual({
      databaseUpdatedAt: "2026-03-31T09:02:00.000Z",
      sourceUpdatedAt: "2026-03-31T09:01:00.000Z",
      sourceUpdatedLabel: "CSV saved on server"
    });
    expect(statMock).toHaveBeenCalledWith("/opt/foxboard/storage/imports/report.csv");
  });

  it("falls back to report_received_at when the local CSV is missing", async () => {
    queryMock.mockResolvedValue({
      rows: [
        {
          databaseUpdatedAt: new Date("2026-03-31T09:02:00.000Z"),
          reportReceivedAt: new Date("2026-03-31T09:00:00.000Z"),
          filePath: "/opt/foxboard/storage/imports/report.csv"
        }
      ]
    });
    statMock.mockRejectedValue(new Error("ENOENT"));

    const { getDashboardImportFreshness } = await import(
      "@/modules/metrics/queries/get-dashboard-import-freshness"
    );
    const freshness = await getDashboardImportFreshness();

    expect(freshness).toEqual({
      databaseUpdatedAt: "2026-03-31T09:02:00.000Z",
      sourceUpdatedAt: "2026-03-31T09:00:00.000Z",
      sourceUpdatedLabel: "Source report received"
    });
  });
});
