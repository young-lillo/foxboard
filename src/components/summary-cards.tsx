type SummaryCardsProps = {
  totalRows: number;
  flaggedRows: number;
  campaignCount: number;
  adgroupCount: number;
};

export function SummaryCards(props: SummaryCardsProps) {
  const cards = [
    ["Rows", props.totalRows],
    ["Flagged", props.flaggedRows],
    ["Campaigns", props.campaignCount],
    ["Adgroups", props.adgroupCount]
  ];

  return (
    <section className="grid summary-grid">
      {cards.map(([label, value]) => (
        <article className="card stack" key={label}>
          <span className="muted">{label}</span>
          <strong style={{ fontSize: 28 }}>{value}</strong>
        </article>
      ))}
    </section>
  );
}
