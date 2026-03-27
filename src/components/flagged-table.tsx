type FlaggedRow = {
  metric_date: string;
  campaign: string;
  adgroup: string;
  contract: string;
  impressions: number;
  bids: number;
  total_bid_amounts: number;
  media_cost: number;
  bid_cpm: number;
  media_cpm: number;
  needs_check: boolean;
};

export function FlaggedTable({ rows }: { rows: FlaggedRow[] }) {
  if (!rows.length) {
    return (
      <section className="table-card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Flagged adgroups</h2>
          <span className="muted">0 rows</span>
        </div>
        <div className="empty-state">
          No flagged rows matched the current filters. Tighten the date range or
          switch to a broader preset if you expected results.
        </div>
      </section>
    );
  }

  return (
    <section className="table-card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Flagged adgroups</h2>
        <span className="muted">{rows.length} rows</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Campaign</th>
              <th>Adgroup</th>
              <th>Contract</th>
              <th>Bid CPM</th>
              <th>Media CPM</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.metric_date}-${row.campaign}-${row.adgroup}-${row.contract}`}>
                <td>{row.metric_date}</td>
                <td>{row.campaign}</td>
                <td>{row.adgroup}</td>
                <td>{row.contract}</td>
                <td>{row.bid_cpm.toFixed(2)}</td>
                <td>{row.media_cpm.toFixed(2)}</td>
                <td>
                  <span
                    className={`status-pill ${
                      row.needs_check ? "status-pill--needs-check" : "status-pill--ok"
                    }`}
                  >
                    {row.needs_check ? "Needs check" : "OK"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
