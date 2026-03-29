import { pool } from "@/db/pool";
import { MetricsFilters } from "@/modules/metrics/filters";
import { buildMetricWhere } from "@/modules/metrics/queries/shared";

const MIN_FLAGGED_GAP = 0.5;

export async function getFlaggedAdgroups(filters: MetricsFilters) {
  const where = buildMetricWhere({ ...filters, flaggedOnly: true });
  const offset = (filters.page - 1) * filters.limit;
  const params = [...where.values, MIN_FLAGGED_GAP, filters.limit, offset];

  const result = await pool.query(
    `
      select
        metric_date::text as metric_date,
        campaign,
        adgroup,
        contract,
        impressions::float8 as impressions,
        bids::float8 as bids,
        total_bid_amounts::float8 as total_bid_amounts,
        media_cost::float8 as media_cost,
        bid_cpm::float8 as bid_cpm,
        media_cpm::float8 as media_cpm,
        (media_cpm - bid_cpm)::float8 as gap,
        needs_check,
        count(*) over()::int as total_count
      from campaign_daily_metrics
      where ${where.text}
        and (media_cpm - bid_cpm) > $${where.values.length + 1}
      order by metric_date desc, (media_cpm - bid_cpm) desc
      limit $${where.values.length + 2}
      offset $${where.values.length + 3}
    `,
    params
  );

  return {
    rows: result.rows,
    total: result.rows[0]?.total_count ?? 0
  };
}
