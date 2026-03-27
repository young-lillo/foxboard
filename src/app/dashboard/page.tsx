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
      <section className="grid hero-panel hero-panel--split">
        <div className="stack">
          <span className="eyebrow">Campaign Health Feed</span>
          <h1>Review the adgroups where pricing discipline is slipping.</h1>
          <p className="lead">
            This board surfaces the exact rows where Media CPM is overtaking Bid
            CPM, so you can re-check setup before the issue spreads across the
            campaign.
          </p>
          <div className="chip-row">
            <span className="chip">90-day report history</span>
            <span className="chip">Direct CSV ingestion</span>
            <span className="chip chip-dark">Live internal dashboard</span>
          </div>
        </div>
        <aside className="mini-card">
          <span className="eyebrow">Today&apos;s Focus</span>
          <div className="rule-box">
            <span className="muted">Flagged rows</span>
            <strong>{summary.flagged_rows.toLocaleString()}</strong>
          </div>
          <div className="rule-box">
            <span className="muted">Tracked campaigns</span>
            <strong>{summary.campaign_count.toLocaleString()}</strong>
          </div>
          <div className="rule-box rule-callout">
            <span className="muted">Core rule</span>
            <strong>Flag when Media CPM &gt; Bid CPM.</strong>
          </div>
        </aside>
      </section>
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
