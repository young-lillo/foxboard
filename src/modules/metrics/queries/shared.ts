import {
  defaultMetricDateFrom,
  defaultMetricDateTo,
  MetricsFilters
} from "@/modules/metrics/filters";

export function buildMetricWhere(filters: MetricsFilters) {
  const clauses = [
    "metric_date between $1 and $2"
  ];
  const values: unknown[] = [
    filters.from ?? defaultMetricDateFrom(),
    filters.to ?? defaultMetricDateTo()
  ];

  if (filters.advertiser) {
    values.push(filters.advertiser);
    clauses.push(`advertiser = $${values.length}`);
  }

  if (filters.campaign) {
    values.push(filters.campaign);
    clauses.push(`campaign = $${values.length}`);
  }

  if (filters.adgroup) {
    values.push(filters.adgroup);
    clauses.push(`adgroup = $${values.length}`);
  }

  if (filters.contract) {
    values.push(filters.contract);
    clauses.push(`contract = $${values.length}`);
  }

  if (filters.flaggedOnly) {
    clauses.push("needs_check = true");
  }

  return {
    text: clauses.join(" and "),
    values
  };
}
