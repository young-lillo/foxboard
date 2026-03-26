import Link from "next/link";

import { signOut } from "@/auth";
import { SessionUser } from "@/components/session-user";

type AppHeaderProps = {
  role: "admin" | "viewer";
  email: string;
};

export function AppHeader({ role, email }: AppHeaderProps) {
  return (
    <header className="card row" style={{ justifyContent: "space-between" }}>
      <div className="row">
        <Link href="/dashboard">
          <strong>Foxboard</strong>
        </Link>
        <Link className="muted" href="/listen">
          Listen
        </Link>
        <Link className="muted" href="/imports">
          Import history
        </Link>
      </div>
      <div className="row">
        <SessionUser email={email} role={role} />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="button" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
