import { Pool } from "pg";

import { env } from "@/lib/env";

declare global {
  var __foxboardPool: Pool | undefined;
}

export const pool =
  global.__foxboardPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === "production" ? 10 : 4
  });

if (env.NODE_ENV !== "production") {
  global.__foxboardPool = pool;
}
