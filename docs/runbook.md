# Runbook

## Manual Import

```bash
npm run ingest:gmail
```

Expected output fields:

- `scanned`
- `processed`
- `skipped`
- `failed`

## Cleanup Old CSV

```bash
npm run cleanup:imports
```

## Promote Admin

```sql
update users set role = 'admin' where email = 'user@example.com';
```

## Import Failure Triage

1. Check latest runs from `/imports` page (admin only).
2. Inspect `import_runs.status` and `import_runs.error_message`.
3. Re-run import manually after fixing credential/link/schema issue.
