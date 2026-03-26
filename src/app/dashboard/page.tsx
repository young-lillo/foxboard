import { AppHeader } from "@/components/app-header";
import { FiltersForm } from "@/components/filters-form";
import { FlaggedTable } from "@/components/flagged-table";
import { Pagination } from "@/components/pagination";
import { SummaryCards } from "@/components/summary-cards";
import { requireSession } from "@/modules/auth/guards";
import { parseMetricsFilters } from "@/modules/metrics/filters";
import { getFlaggedAdgroups } from "@/modules/metrics/queries/get-flagged-adgroups";
import { getCampaignSummary } from "@/modules/metrics/queries/get-campaign-summary";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const resolvedSearchParams = await searchParams;
  const filters = parseMetricsFilters(resolvedSearchParams);
  const [summary, flagged] = await Promise.all([
    getCampaignSummary(filters),
    getFlaggedAdgroups(filters)
  ]);

  return (
    <main className="shell stack">
      <AppHeader email={session.user.email!} role={session.user.role} />
      <SummaryCards
        adgroupCount={summary.adgroup_count}
        campaignCount={summary.campaign_count}
        flaggedRows={summary.flagged_rows}
        totalRows={summary.total_rows}
      />
      <FiltersForm searchParams={resolvedSearchParams} />
      <Pagination
        basePath="/dashboard"
        limit={filters.limit}
        page={filters.page}
        searchParams={resolvedSearchParams}
        total={flagged.total}
      />
      <FlaggedTable rows={flagged.rows} />
    </main>
  );
}
