import { pool } from "@/db/pool";
import { MetricsFilters } from "@/modules/metrics/filters";
import { buildMetricWhere } from "@/modules/metrics/queries/shared";

export async function getMetricFilterOptions(filters: MetricsFilters) {
  const advertiserWhere = buildMetricWhere({
    ...filters,
    advertiser: undefined,
    page: 1,
    limit: 100
  });
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
  const [advertisersResult, campaignsResult, contractsResult] = await Promise.all([
    pool.query<{ value: string }>(
      `
        select distinct advertiser as value
        from campaign_daily_metrics
        where ${advertiserWhere.text}
        order by advertiser asc
      `,
      advertiserWhere.values
    ),
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
    advertisers: advertisersResult.rows.map((row) => row.value),
    campaigns: campaignsResult.rows.map((row) => row.value),
    contracts: contractsResult.rows.map((row) => row.value)
  };
}
