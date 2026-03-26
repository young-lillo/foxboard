import { safeCpm, shouldCheckMetric } from "@/modules/metrics/formulas";

describe("formulas", () => {
  it("returns 0 when denominator is 0", () => {
    expect(safeCpm(100, 0)).toBe(0);
  });

  it("calculates CPM", () => {
    expect(safeCpm(200, 1000)).toBe(200);
  });

  it("flags when bid CPM is lower than media CPM", () => {
    expect(shouldCheckMetric(1.2, 2.2)).toBe(true);
    expect(shouldCheckMetric(2.2, 1.2)).toBe(false);
  });
});
