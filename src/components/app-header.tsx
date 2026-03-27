import Link from "next/link";

import { signOut } from "@/auth";
import { SessionUser } from "@/components/session-user";

type AppHeaderProps = {
  role: "admin" | "viewer";
  email: string;
};

export function AppHeader({ role, email }: AppHeaderProps) {
  return (
    <header className="nav-shell stack">
      <div className="brand-lockup">
        <Link className="brand-link" href="/dashboard">
          <span className="brand-badge">FOX</span>
          <span className="brand-meta">
            <strong className="brand-title">Foxboard</strong>
            <span className="muted small-copy">Internal campaign watchtower</span>
          </span>
        </Link>
        <nav className="nav-links">
          <Link className="nav-link" href="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-link" href="/listen">
            Listen
          </Link>
        </nav>
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <SessionUser email={email} role={role} />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="button button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
