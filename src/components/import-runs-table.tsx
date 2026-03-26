type ImportRun = {
  id: string;
  status: string;
  gmailMessageId: string;
  sourceHost: string;
  reportReceivedAt: string;
  rowCount: number;
  importedRowCount: number;
  errorMessage: string | null;
};

export function ImportRunsTable({ runs }: { runs: ImportRun[] }) {
  return (
    <section className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Received</th>
              <th>Rows</th>
              <th>Imported</th>
              <th>Source</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>{run.status}</td>
                <td>{new Date(run.reportReceivedAt).toLocaleString()}</td>
                <td>{run.rowCount}</td>
                <td>{run.importedRowCount}</td>
                <td>{run.sourceHost}</td>
                <td>{run.errorMessage ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
