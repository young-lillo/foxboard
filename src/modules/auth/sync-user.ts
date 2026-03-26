import { randomUUID } from "node:crypto";

import { pool } from "@/db/pool";
import { UserRecord } from "@/types";

type SyncUserInput = {
  email: string;
  name: string | null;
  image: string | null;
};

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `
      select id, email, name, image, role
      from users
      where email = $1
      limit 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function syncUser(input: SyncUserInput): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `
      insert into users (id, email, name, image)
      values ($1, $2, $3, $4)
      on conflict (email)
      do update set
        name = excluded.name,
        image = excluded.image,
        updated_at = now()
      returning id, email, name, image, role
    `,
    [randomUUID(), input.email, input.name, input.image]
  );

  return result.rows[0];
}
