import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { PoolClient } from "pg";

import { pool } from "@/db/pool";

const MIGRATION_TABLE_SQL = `
  create table if not exists schema_migrations (
    id serial primary key,
    filename text not null unique,
    applied_at timestamptz not null default now()
  );
`;

export async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query(MIGRATION_TABLE_SQL);
    const dir = path.join(process.cwd(), "src", "db", "migrations");
    const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();

    for (const file of files) {
      const exists = await client.query(
        "select 1 from schema_migrations where filename = $1",
        [file]
      );

      if (exists.rowCount) {
        continue;
      }

      const sql = await readFile(path.join(dir, file), "utf8");

      await client.query("begin");

      try {
        await client.query(sql);
        await client.query(
          "insert into schema_migrations (filename) values ($1)",
          [file]
        );
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
