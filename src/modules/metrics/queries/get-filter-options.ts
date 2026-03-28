import { pool } from "@/db/pool";
import { MetricsFilters } from "@/modules/metrics/filters";
import { buildMetricWhere } from "@/modules/metrics/queries/shared";

export async function getMetricFilterOptions(filters: MetricsFilters) {
  const campaignWhere = buildMetricWhere({
    ...filters,
    campaign: undefined,
    page: 1,
    limit: 100
  });
  const contractWhere = buildMetricWhere({
    ...filters,
    contract: undefined,
    page: 1,
    limit: 100
  });
  const [campaignsResult, contractsResult] = await Promise.all([
    pool.query<{ value: string }>(
      `
        select distinct campaign as value
        from campaign_daily_metrics
        where ${campaignWhere.text}
        order by campaign asc
      `,
      campaignWhere.values
    ),
    pool.query<{ value: string }>(
      `
        select distinct contract as value
        from campaign_daily_metrics
        where ${contractWhere.text}
        order by contract asc
      `,
      contractWhere.values
    )
  ]);

  return {
    campaigns: campaignsResult.rows.map((row) => row.value),
    contracts: contractsResult.rows.map((row) => row.value)
  };
}
