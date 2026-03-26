# System Architecture

## Runtime

- Next.js app process
- PostgreSQL database
- systemd timer for Gmail import
- Caddy reverse proxy

## Import Flow

1. Gmail API fetches matching mail.
2. Import run claims `gmail_message_id` in `import_runs` (dedupe gate).
3. Link extractor accepts allowlisted `https` URL only.
4. Downloader saves raw file locally with timeout and size guard.
5. Parser validates headers and normalizes metrics rows.
6. Upsert stores daily facts in `campaign_daily_metrics`.
7. Dashboard reads precomputed flags.

## Import Run States

- `pending`: run claimed, waiting for file processing
- `downloaded`: raw CSV file saved
- `imported`: facts persisted successfully
- `failed`: error persisted in `import_runs.error_message`
