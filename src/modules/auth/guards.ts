import { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

type AppSession = Session & {
  user: NonNullable<Session["user"]> & {
    email: string;
    role: "admin" | "viewer";
  };
};

export async function requireSession(): Promise<AppSession> {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return session as AppSession;
}

export async function requireAdmin(): Promise<AppSession> {
  const session = await requireSession();

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
