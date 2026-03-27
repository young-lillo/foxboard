import { AppHeader } from "@/components/app-header";
import { FiltersForm } from "@/components/filters-form";
import { FlaggedTable } from "@/components/flagged-table";
import { Pagination } from "@/components/pagination";
import { requireSession } from "@/modules/auth/guards";
import { parseMetricsFilters } from "@/modules/metrics/filters";
import { getFlaggedAdgroups } from "@/modules/metrics/queries/get-flagged-adgroups";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const resolvedSearchParams = await searchParams;
  const filters = parseMetricsFilters(resolvedSearchParams);
  const flagged = await getFlaggedAdgroups(filters);

  return (
    <main className="shell stack">
      <AppHeader email={session.user.email!} role={session.user.role} />
      <FiltersForm searchParams={resolvedSearchParams} />
      <FlaggedTable rows={flagged.rows} />
      <Pagination
        basePath="/dashboard"
        limit={filters.limit}
        page={filters.page}
        searchParams={resolvedSearchParams}
        total={flagged.total}
      />
    </main>
  );
}
