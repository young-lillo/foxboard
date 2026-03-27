import Link from "next/link";

import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const hasAppSession = Boolean(session?.user?.email && session.user.id);

  return (
    <main className="shell stack">
      <section className="grid hero-panel hero-panel--split">
        <div className="stack">
          <span className="eyebrow">Campaign Watchtower</span>
          <h1>Spot weak CPMs before they burn through budget.</h1>
          <p className="lead">
            Foxboard pulls your daily report links from Gmail, stores the last 90
            days of campaign facts, and flags the adgroups where Media CPM beats
            Bid CPM.
          </p>
          <div className="row">
            <Link className="button" href={hasAppSession ? "/dashboard" : "/login"}>
              {hasAppSession ? "Open dashboard" : "Sign in with Google"}
            </Link>
            <Link className="button button-secondary" href="/imports">
              View import history
            </Link>
            <Link className="button button-dark" href={hasAppSession ? "/listen" : "/login"}>
              Open listening room
            </Link>
          </div>
          <div className="chip-row">
            <span className="chip">Direct CSV link ingest</span>
            <span className="chip">90-day overlap handling</span>
            <span className="chip">Company Google access</span>
          </div>
        </div>
        <aside className="mini-card">
          <span className="eyebrow">Rule Engine</span>
          <div className="rule-box">
            <span className="muted">Bid CPM</span>
            <strong>Total Bid Amounts / Bids × 1000</strong>
          </div>
          <div className="rule-box">
            <span className="muted">Media CPM</span>
            <strong>Media Cost / Impressions × 1000</strong>
          </div>
          <div className="rule-box rule-callout">
            <span className="muted">Flag Logic</span>
            <strong>Review any adgroup where Media CPM is higher.</strong>
          </div>
        </aside>
      </section>
      <section className="grid feature-strip">
        <article className="summary-card stack">
          <span className="summary-kicker">Daily Feed</span>
          <strong>One automated import flow</strong>
          <p className="summary-note">
            Gmail grabs the newest Daily Report email and loads the CSV without
            manual download steps.
          </p>
        </article>
        <article className="summary-card stack">
          <span className="summary-kicker">Sharp Filters</span>
          <strong>Drill into contract, campaign, or adgroup</strong>
          <p className="summary-note">
            Narrow the board quickly instead of scanning thousands of raw rows in
            spreadsheets.
          </p>
        </article>
        <article className="summary-card summary-card--highlight stack">
          <span className="summary-kicker">Team Access</span>
          <strong>Internal-only Google login</strong>
          <p className="summary-note">
            Share the same source of truth across the team without sending files
            around every morning.
          </p>
        </article>
      </section>
    </main>
  );
}
