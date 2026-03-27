import { AppHeader } from "@/components/app-header";
import { ImportRunsTable } from "@/components/import-runs-table";
import { ManualImportButton } from "@/components/manual-import-button";
import { requireAdmin } from "@/modules/auth/guards";
import { getImportRuns } from "@/modules/metrics/queries/get-import-runs";

export default async function ImportsPage() {
  const session = await requireAdmin();
  const runs = await getImportRuns(30);

  return (
    <main className="shell stack">
      <AppHeader email={session.user.email!} role={session.user.role} />
      <section className="grid hero-panel hero-panel--split">
        <div className="stack">
          <span className="eyebrow">Import Control</span>
          <h1>Review recent pulls and rerun ingestion when needed.</h1>
          <p className="lead">
            This page shows the latest report imports, their status, row counts,
            and any schema or processing error returned by the ingest job.
          </p>
        </div>
        <div className="mini-card">
          <span className="eyebrow">Manual Trigger</span>
          <p className="muted">
            Use this only when you need to re-check the newest Daily Report
            immediately.
          </p>
          <ManualImportButton />
        </div>
      </section>
      <ImportRunsTable runs={runs} />
    </main>
  );
}
