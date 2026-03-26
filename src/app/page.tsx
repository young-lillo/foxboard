import Link from "next/link";

import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="shell stack">
      <section className="card stack">
        <p className="muted">Foxboard</p>
        <h1>Campaign checks without opening raw CSVs.</h1>
        <p className="muted">
          Gmail pulls the report link. Postgres stores daily facts. Dashboard shows
          which adgroups need checking.
        </p>
        <div className="row">
          <Link className="button" href={session ? "/dashboard" : "/login"}>
            {session ? "Open dashboard" : "Sign in"}
          </Link>
          <Link className="button button-secondary" href="/imports">
            Import history
          </Link>
        </div>
      </section>
    </main>
  );
}
