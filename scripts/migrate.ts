import { runMigrations } from "@/db/sql";

async function main() {
  await runMigrations();
  process.stdout.write("Migrations complete\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
