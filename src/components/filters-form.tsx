type FiltersFormProps = {
  advertiserOptions: string[];
  campaignOptions: string[];
  contractOptions: string[];
  searchParams: Record<string, string | string[] | undefined>;
};

export function FiltersForm({
  advertiserOptions,
  campaignOptions,
  contractOptions,
  searchParams
}: FiltersFormProps) {
  const presets = [
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 }
  ];

  return (
    <section className="filters-card filters-card--plain stack">
      <div className="chip-row">
        {presets.map((preset) => (
          <a className="chip" href={presetHref(preset.days, searchParams)} key={preset.label}>
            Last {preset.label}
          </a>
        ))}
      </div>
      <form action="/dashboard" className="stack">
        <div className="filters-grid">
          <div className="field field--date">
            <label htmlFor="from">From</label>
            <input className="input" defaultValue={valueOf(searchParams.from)} id="from" name="from" type="date" />
          </div>
          <div className="field field--date">
            <label htmlFor="to">To</label>
            <input className="input" defaultValue={valueOf(searchParams.to)} id="to" name="to" type="date" />
          </div>
          <div className="field">
            <label htmlFor="advertiser">Advertiser</label>
            <select className="input" defaultValue={valueOf(searchParams.advertiser)} id="advertiser" name="advertiser">
              <option value="">All advertisers</option>
              {advertiserOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="contract">Contract</label>
            <select className="input" defaultValue={valueOf(searchParams.contract)} id="contract" name="contract">
              <option value="">All contracts</option>
              {contractOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="campaign">Campaign</label>
            <select className="input" defaultValue={valueOf(searchParams.campaign)} id="campaign" name="campaign">
              <option value="">All campaigns</option>
              {campaignOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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

function presetHref(
  days: number,
  searchParams: Record<string, string | string[] | undefined>
) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  const params = new URLSearchParams();

  copyParam(params, "advertiser", searchParams.advertiser);
  copyParam(params, "contract", searchParams.contract);
  copyParam(params, "campaign", searchParams.campaign);
  copyParam(params, "limit", searchParams.limit);
  params.set("from", from.toISOString().slice(0, 10));
  params.set("to", to.toISOString().slice(0, 10));

  return `/dashboard?${params.toString()}`;
}

function copyParam(
  params: URLSearchParams,
  key: string,
  value?: string | string[]
) {
  const resolvedValue = valueOf(value);

  if (!resolvedValue) {
    return;
  }

  params.set(key, resolvedValue);
}
