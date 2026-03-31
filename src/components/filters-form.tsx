import { ManualImportButton } from "@/components/manual-import-button";
import type { DashboardImportFreshness } from "@/modules/metrics/queries/get-dashboard-import-freshness";
import type { Role } from "@/types";

type FiltersFormProps = {
  advertiserOptions: string[];
  campaignOptions: string[];
  contractOptions: string[];
  importFreshness: DashboardImportFreshness | null;
  importFreshnessUnavailable: boolean;
  role: Role;
  searchParams: Record<string, string | string[] | undefined>;
};

export function FiltersForm({
  advertiserOptions,
  campaignOptions,
  contractOptions,
  importFreshness,
  importFreshnessUnavailable,
  role,
  searchParams
}: FiltersFormProps) {
  const presets = [
    { label: "Yesterday", type: "yesterday" as const },
    { label: "7d", days: 7 },
    { label: "30d", days: 30 }
  ];

  return (
    <section className="filters-card filters-card--plain stack">
      <div className="chip-row">
        {presets.map((preset) => (
          <a
            className="chip"
            href={presetHref(preset, searchParams)}
            key={preset.label}
          >
            {"type" in preset ? preset.label : `Last ${preset.label}`}
          </a>
        ))}
        {role === "admin" ? (
          <ManualImportButton
            buttonClassName="chip"
            idleLabel="Refresh data"
            pendingLabel="Refreshing..."
            wrapperClassName="chip-row"
          />
        ) : null}
      </div>
      <form action="/dashboard" className="stack">
        <div className="filters-grid filters-grid--dashboard">
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
        <p className="muted small-copy" style={{ margin: 0 }}>
          {formatImportFreshness(importFreshness, importFreshnessUnavailable)}
        </p>
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
  preset: { label: string; type: "yesterday" } | { label: string; days: number },
  searchParams: Record<string, string | string[] | undefined>
) {
  const { from, to } = resolvePresetRange(preset);
  const params = new URLSearchParams();

  copyParam(params, "advertiser", searchParams.advertiser);
  copyParam(params, "contract", searchParams.contract);
  copyParam(params, "campaign", searchParams.campaign);
  copyParam(params, "limit", searchParams.limit);
  params.set("from", from.toISOString().slice(0, 10));
  params.set("to", to.toISOString().slice(0, 10));

  return `/dashboard?${params.toString()}`;
}

function resolvePresetRange(
  preset: { label: string; type: "yesterday" } | { label: string; days: number }
) {
  const to = new Date();

  if ("type" in preset) {
    to.setDate(to.getDate() - 1);

    return {
      from: to,
      to
    };
  }

  const from = new Date(to);
  from.setDate(to.getDate() - (preset.days - 1));

  return {
    from,
    to
  };
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

const IMPORT_TIME_FORMATTER = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  month: "short",
  timeZone: "Australia/Melbourne",
  timeZoneName: "short",
  year: "numeric"
});

function formatImportFreshness(
  importFreshness: DashboardImportFreshness | null,
  importFreshnessUnavailable: boolean
) {
  if (importFreshnessUnavailable) {
    return "Import freshness unavailable right now.";
  }

  if (!importFreshness) {
    return "No successful CSV import yet.";
  }

  return `Database updated: ${formatTimestamp(importFreshness.databaseUpdatedAt)}. ${importFreshness.sourceUpdatedLabel}: ${formatTimestamp(importFreshness.sourceUpdatedAt)}.`;
}

function formatTimestamp(value: string) {
  return IMPORT_TIME_FORMATTER.format(new Date(value));
}
