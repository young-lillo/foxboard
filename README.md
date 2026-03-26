# Foxboard

Internal campaign monitoring app.

## Stack

- Next.js + TypeScript
- PostgreSQL
- Auth.js Google login
- Gmail API import job
- Caddy on Ubuntu VPS

## Core Flow

1. Gmail receives daily report email.
2. Import job extracts direct CSV link.
3. CSV rows are validated and upserted into `campaign_daily_metrics`.
4. Dashboard shows flagged adgroups where `bid_cpm < media_cpm`.

## Commands

```bash
npm install
npm run db:migrate
npm run dev
```

Other commands:

```bash
npm run lint
npm run typecheck
npm run ingest:gmail
npm run cleanup:imports
npm run test
npm run build
```

## Required Env

Copy `.env.example` to `.env` and fill:

- `APP_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `ALLOWED_EMAIL_DOMAIN`
- `GMAIL_USER`
- `GMAIL_QUERY`
- `REPORT_STORAGE_DIR`
- `REPORT_RETENTION_DAYS`
- `REPORT_HOST_ALLOWLIST`

`npm run build` sets `FOXBOARD_ALLOW_ENV_DEFAULTS=1` so build can complete in CI/local without secrets. Runtime (`npm run start`, ingest timers) still requires real env values.

For Ubuntu `/etc/foxboard.env`, quote `GMAIL_QUERY` because it contains spaces:

```env
GMAIL_QUERY='from:(noreply@thetradedesk.com) subject:("Report Available: Daily Report")'
```

## Auth

- Google only
- company domain only
- first users default to `viewer`
- admin must be promoted in DB

## Gmail Ingest Credentials

Import job uses a separate Google OAuth refresh token from the app login flow.

- OAuth scope needed: `https://www.googleapis.com/auth/gmail.readonly`
- mailbox should match `GMAIL_USER`
- refresh token should be generated for the import mailbox or delegated account
- query should target the sender `noreply@thetradedesk.com`
- importer only fetches the latest matching email

## Deploy

See `docs/deployment-guide.md`.
