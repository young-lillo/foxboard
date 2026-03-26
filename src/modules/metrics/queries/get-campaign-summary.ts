import { pool } from "@/db/pool";
import { MetricsFilters } from "@/modules/metrics/filters";
import { buildMetricWhere } from "@/modules/metrics/queries/shared";

export async function getCampaignSummary(filters: MetricsFilters) {
  const where = buildMetricWhere(filters);

  const result = await pool.query(
    `
      select
        count(*)::int as total_rows,
        count(*) filter (where needs_check)::int as flagged_rows,
        count(distinct campaign)::int as campaign_count,
        count(distinct adgroup)::int as adgroup_count
      from campaign_daily_metrics
      where ${where.text}
    `,
    where.values
  );

  return result.rows[0];
}
