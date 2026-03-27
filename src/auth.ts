import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { env } from "@/lib/env";
import {
  handleJwt,
  handleSession,
  handleSignIn
} from "@/modules/auth/callbacks";
import { applyAuthRuntimeEnv } from "@/modules/auth/runtime-config";

applyAuthRuntimeEnv();

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
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
    signIn: handleSignIn,
    jwt: handleJwt,
    session: handleSession
  }
});
