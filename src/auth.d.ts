import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "admin" | "viewer";
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "admin" | "viewer";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "admin" | "viewer";
  }
}
