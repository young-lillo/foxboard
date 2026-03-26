# Codebase Summary

## App Shape

- `src/app`: Next.js routes and pages
- `src/modules/auth`: auth config and guards
- `src/modules/ingest`: Gmail import pipeline
- `src/modules/listen`: listening-room queries, validation, player sync helpers
- `src/modules/metrics`: formulas and query layer
- `src/db`: Postgres pool and migrations
- `scripts`: CLI jobs

## Core Tables

- `users`
- `import_runs`
- `campaign_daily_metrics`
- `listening_rooms`
- `listening_room_queue_items`
- `listening_room_playback_state`
- `listening_room_presence`
