import { AppHeader } from "@/components/app-header";
import { FiltersForm } from "@/components/filters-form";
import { FlaggedTable } from "@/components/flagged-table";
import { Pagination } from "@/components/pagination";
import { requireSession } from "@/modules/auth/guards";
import { parseMetricsFilters } from "@/modules/metrics/filters";
import { getMetricFilterOptions } from "@/modules/metrics/queries/get-filter-options";
import { getFlaggedAdgroups } from "@/modules/metrics/queries/get-flagged-adgroups";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const resolvedSearchParams = await searchParams;
  const filters = parseMetricsFilters(resolvedSearchParams);
  const [flagged, filterOptions] = await Promise.all([
    getFlaggedAdgroups(filters),
    getMetricFilterOptions(filters)
  ]);
  const dashboardSearchParams = {
    from: filters.from,
    to: filters.to,
    contract: filters.contract,
    campaign: filters.campaign,
    limit: filters.limit === 25 ? undefined : String(filters.limit)
  };

  return (
    <main className="shell shell--dashboard stack">
      <AppHeader email={session.user.email!} role={session.user.role} />
      <FiltersForm
        campaignOptions={filterOptions.campaigns}
        contractOptions={filterOptions.contracts}
        searchParams={dashboardSearchParams}
      />
      <FlaggedTable rows={flagged.rows} />
      <Pagination
        basePath="/dashboard"
        limit={filters.limit}
        page={filters.page}
        searchParams={dashboardSearchParams}
        total={flagged.total}
      />
    </main>
  );
}
