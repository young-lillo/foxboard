import {
  defaultMetricDateFrom,
  defaultMetricDateTo,
  parseMetricsFilters
} from "@/modules/metrics/filters";

describe("parseMetricsFilters", () => {
  it("fills empty date strings with the default 7 day range", () => {
    expect(
      parseMetricsFilters({
        advertiser: "Epiroc - RBRIS",
        from: "",
        to: ""
      })
    ).toMatchObject({
      advertiser: "Epiroc - RBRIS",
      from: defaultMetricDateFrom(),
      to: defaultMetricDateTo()
    });
  });

  it("keeps valid ISO date strings", () => {
    expect(
      parseMetricsFilters({
        from: "2026-02-27",
        to: "2026-03-29"
      })
    ).toMatchObject({
      from: "2026-02-27",
      to: "2026-03-29"
    });
  });

  it("fills missing dates with the default 7 day range", () => {
    expect(parseMetricsFilters({})).toMatchObject({
      from: defaultMetricDateFrom(),
      to: defaultMetricDateTo()
    });
  });
});
