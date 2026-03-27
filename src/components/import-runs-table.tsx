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
    <section className="table-card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Latest import runs</h2>
        <span className="muted">{runs.length} recent runs</span>
      </div>
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
                <td>
                  <span className={`status-pill ${statusClassName(run.status)}`}>{run.status}</span>
                </td>
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

function statusClassName(status: string) {
  if (status === "imported") {
    return "status-pill--imported";
  }

  if (status === "failed") {
    return "status-pill--failed";
  }

  if (status === "downloaded") {
    return "status-pill--downloaded";
  }

  return "status-pill--pending";
}
