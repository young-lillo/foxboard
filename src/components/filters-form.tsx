type FiltersFormProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export function FiltersForm({ searchParams }: FiltersFormProps) {
  const presets = [
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 }
  ];

  return (
    <section className="card filters-card stack">
      <div className="chip-row">
        {presets.map((preset) => (
          <a className="chip" href={presetHref(preset.days)} key={preset.label}>
            Last {preset.label}
          </a>
        ))}
      </div>
      <form action="/dashboard" className="stack">
        <div className="filters-grid">
          <div className="field">
            <label htmlFor="from">From</label>
            <input className="input" defaultValue={valueOf(searchParams.from)} id="from" name="from" type="date" />
          </div>
          <div className="field">
            <label htmlFor="to">To</label>
            <input className="input" defaultValue={valueOf(searchParams.to)} id="to" name="to" type="date" />
          </div>
          <div className="field">
            <label htmlFor="contract">Contract</label>
            <input className="input" defaultValue={valueOf(searchParams.contract)} id="contract" name="contract" />
          </div>
          <div className="field">
            <label htmlFor="campaign">Campaign</label>
            <input className="input" defaultValue={valueOf(searchParams.campaign)} id="campaign" name="campaign" />
          </div>
          <div className="field">
            <label htmlFor="adgroup">Adgroup</label>
            <input className="input" defaultValue={valueOf(searchParams.adgroup)} id="adgroup" name="adgroup" />
          </div>
        </div>
        <div className="filters-actions">
          <a className="button button-secondary" href="/dashboard">
            Clear
          </a>
          <button className="button" type="submit">
            Apply
          </button>
        </div>
      </form>
    </section>
  );
}

function valueOf(input?: string | string[]) {
  return Array.isArray(input) ? input[0] : input ?? "";
}

function presetHref(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));

  return `/dashboard?from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}`;
}
