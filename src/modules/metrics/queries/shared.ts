import { MetricsFilters } from "@/modules/metrics/filters";

export function buildMetricWhere(filters: MetricsFilters) {
  const clauses = [
    "metric_date between $1 and $2"
  ];
  const values: unknown[] = [
    filters.from ?? defaultDateFrom(),
    filters.to ?? defaultDateTo()
  ];

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

function defaultDateFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
}

function defaultDateTo() {
  return new Date().toISOString().slice(0, 10);
}
