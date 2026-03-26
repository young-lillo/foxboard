import { pool } from "@/db/pool";
import { MetricsFilters } from "@/modules/metrics/filters";
import { buildMetricWhere } from "@/modules/metrics/queries/shared";

export async function getAdgroupHistory(filters: MetricsFilters) {
  const where = buildMetricWhere(filters);
  const result = await pool.query(
    `
      select
        metric_date,
        campaign,
        adgroup,
        contract,
        bid_cpm::float8 as bid_cpm,
        media_cpm::float8 as media_cpm,
        needs_check
      from campaign_daily_metrics
      where ${where.text}
      order by metric_date asc
      limit 180
    `,
    where.values
  );

  return result.rows;
}
