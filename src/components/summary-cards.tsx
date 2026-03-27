type SummaryCardsProps = {
  totalRows: number;
  flaggedRows: number;
  campaignCount: number;
  adgroupCount: number;
};

export function SummaryCards(props: SummaryCardsProps) {
  const cards = [
    {
      label: "Tracked rows",
      value: props.totalRows,
      note: "All imported daily facts"
    },
    {
      label: "Flagged rows",
      value: props.flaggedRows,
      note: "Media CPM is higher",
      highlighted: true
    },
    {
      label: "Campaigns",
      value: props.campaignCount,
      note: "Distinct campaign count"
    },
    {
      label: "Adgroups",
      value: props.adgroupCount,
      note: "Distinct adgroups tracked"
    }
  ];

  return (
    <section className="grid summary-grid">
      {cards.map((card) => (
        <article
          className={`summary-card stack ${card.highlighted ? "summary-card--highlight" : ""}`}
          key={card.label}
        >
          <span className="summary-kicker">{card.label}</span>
          <strong className="summary-value">{card.value.toLocaleString()}</strong>
          <span className="summary-note">{card.note}</span>
        </article>
      ))}
    </section>
  );
}
