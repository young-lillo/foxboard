# Deployment Guide

## Services

- `foxboard-web.service`
- `foxboard-ingest.service`
- `foxboard-ingest.timer`
- `foxboard-cleanup.service`
- `foxboard-cleanup.timer`

## Host

- Ubuntu 24.04
- Node 22
- PostgreSQL 16
- Caddy

## Steps

1. Install Node, Postgres, Caddy.
2. Create app user and deploy code.
3. Copy `.env`.
4. Run `npm ci`, `npm run build`, `npm run db:migrate`.
5. Enable systemd units.
6. Point Caddy to app port 3000.

## Runtime Config Notes

- Build uses `FOXBOARD_ALLOW_ENV_DEFAULTS=1` from `package.json` for compile-time fallback only.
- Runtime services must use real env values from `/etc/foxboard.env`.
- Do not rely on fallback defaults in production services.

## Gmail Access

Server-side Gmail polling needs an OAuth refresh token for the target mailbox.

- Use Gmail readonly scope.
- Treat this token as separate from website login OAuth.
- Verify token can read the exact mailbox set in `GMAIL_USER`.
