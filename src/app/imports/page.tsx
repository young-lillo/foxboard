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
      <section className="card stack">
        <h1 style={{ margin: 0 }}>Import history</h1>
        <p className="muted" style={{ margin: 0 }}>
          Review the last report pulls and run a manual import when needed.
        </p>
        <ManualImportButton />
      </section>
      <ImportRunsTable runs={runs} />
    </main>
  );
}
