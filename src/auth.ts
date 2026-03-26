import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { env } from "@/lib/env";
import { isAllowedEmail } from "@/modules/auth/domain-access";
import { syncUser } from "@/modules/auth/sync-user";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user }) {
      return isAllowedEmail(user.email);
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;

      if (!email || !isAllowedEmail(email)) {
        return token;
      }

      const dbUser = await syncUser({
        email,
        image: user?.image ?? token.picture ?? null,
        name: user?.name ?? token.name ?? null
      });

      token.role = dbUser.role;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role: "admin" | "viewer" }).role =
          (token.role as "admin" | "viewer" | undefined) ?? "viewer";
      }

      return session;
    }
  }
});
