import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.email && session.user.id) {
    redirect("/dashboard");
  }

  return (
    <main className="shell stack">
      <section className="grid hero-panel hero-panel--split">
        <div className="stack">
          <h1>Sign in to check Contract bidding.</h1>
          <p className="lead">Use labelium.com Google account to access</p>
          <div className="chip-row">
            <span className="chip">Google Workspace login</span>
            <span className="chip">Company domains only</span>
            <span className="chip">Shared internal reporting</span>
          </div>
        </div>
        <section className="mini-card">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button className="button" type="submit">
              Continue with Google
            </button>
          </form>
          <div className="rule-box">
            <span className="muted">After sign-in</span>
            <strong>You land directly on the campaign health dashboard.</strong>
          </div>
        </section>
      </section>
    </main>
  );
}
