type FlaggedRow = {
  metric_date: string | Date;
  campaign: string;
  adgroup: string;
  contract: string;
  impressions: number;
  bids: number;
  total_bid_amounts: number;
  media_cost: number;
  bid_cpm: number;
  media_cpm: number;
  gap: number;
  needs_check: boolean;
};

export function FlaggedTable({ rows }: { rows: FlaggedRow[] }) {
  if (!rows.length) {
    return (
      <section className="table-card table-card--plain">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Contracts to check</h2>
          <span className="muted">0 rows</span>
        </div>
        <div className="empty-state">
          No rows matched the current filters. Widen the date range or clear the
          date filters if you expected impacted contracts here.
        </div>
      </section>
    );
  }

  return (
    <section className="table-card table-card--plain">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Contracts to check</h2>
        <span className="muted">{rows.length} rows on this page</span>
      </div>
      <div className="table-wrap">
        <table className="table table--flagged">
          <thead>
            <tr>
              <th className="table-col-contract">Contract</th>
              <th className="table-col-campaign">Campaign</th>
              <th className="table-col-adgroup">Adgroup</th>
              <th className="table-col-date">Date</th>
              <th className="table-col-number">Bid CPM</th>
              <th className="table-col-number">Media CPM</th>
              <th className="table-col-number">Gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${formatMetricDate(row.metric_date)}-${row.campaign}-${row.adgroup}-${row.contract}`}
              >
                <td className="table-col-contract">{displayValue(row.contract)}</td>
                <td className="table-col-campaign">{displayValue(row.campaign)}</td>
                <td className="table-col-adgroup">{displayValue(row.adgroup)}</td>
                <td className="table-col-date">{formatMetricDate(row.metric_date)}</td>
                <td className="table-col-number">{row.bid_cpm.toFixed(2)}</td>
                <td className="table-col-number">{row.media_cpm.toFixed(2)}</td>
                <td className="table-col-number table-gap-negative">
                  {row.gap.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatMetricDate(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function displayValue(value: string) {
  return value.trim() || "-";
}
