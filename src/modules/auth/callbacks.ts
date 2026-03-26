import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

import { isAllowedEmail } from "@/modules/auth/domain-access";
import { getUserByEmail, syncUser } from "@/modules/auth/sync-user";

type CallbackUser = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
};

function isRole(value: unknown): value is "admin" | "viewer" {
  return value === "admin" || value === "viewer";
}

export async function handleSignIn({ user }: { user: CallbackUser }) {
  return isAllowedEmail(user.email);
}

export async function handleJwt({
  token,
  user
}: {
  token: JWT;
  user?: CallbackUser | null;
}) {
  const email = user?.email ?? token.email;

  if (!email || !isAllowedEmail(email)) {
    return token;
  }

  if (user) {
    const dbUser = await syncUser({
      email,
      image: user.image ?? token.picture ?? null,
      name: user.name ?? token.name ?? null
    });

    token.userId = dbUser.id;
    token.role = dbUser.role;
    return token;
  }

  if (typeof token.userId === "string" && isRole(token.role)) {
    return token;
  }

  const dbUser = await getUserByEmail(email);

  if (!dbUser) {
    return token;
  }

  token.userId = dbUser.id;
  token.role = dbUser.role;
  return token;
}

export function handleSession({
  session,
  token
}: {
  session: Session;
  token: JWT;
}) {
  if (session.user) {
    (session.user as typeof session.user & { id: string }).id =
      typeof token.userId === "string" ? token.userId : "";
    (session.user as typeof session.user & { role: "admin" | "viewer" }).role =
      isRole(token.role) ? token.role : "viewer";
  }

  return session;
}
