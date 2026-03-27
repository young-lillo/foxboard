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

Current ingest assumptions:

- sender is `noreply@thetradedesk.com`
- query targets `Report Available: Daily Report`
- only the latest matching email is fetched
- scheduled runs happen 3 times between `09:00` and `10:00` Melbourne time

## Cleanup Old CSV

```bash
npm run cleanup:imports
```

## Promote Admin

```sql
update users set role = 'admin' where email = 'user@example.com';
```

Allowed login domains can be set in `/etc/foxboard.env`:

```env
ALLOWED_EMAIL_DOMAIN=foxcatcher.com.au,labelium.com
```

## Import Failure Triage

1. Check latest runs from `/imports` page (admin only).
2. Inspect `import_runs.status` and `import_runs.error_message`.
3. Re-run import manually after fixing credential/link/schema issue.
