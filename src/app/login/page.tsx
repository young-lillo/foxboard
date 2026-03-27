import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.email && session.user.id) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <section className="card stack" style={{ maxWidth: 520 }}>
        <p className="muted">Company access only</p>
        <h1>Sign in with your work Google account.</h1>
        <p className="muted">
          Only addresses from the allowed company domain can access the app.
        </p>
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
      </section>
    </main>
  );
}
