import { Session } from "next-auth";

export function getSessionRole(session: Session | null) {
  const role = (session?.user as { role?: "admin" | "viewer" } | undefined)?.role;
  return role ?? "viewer";
}
