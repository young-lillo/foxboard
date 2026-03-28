# Codebase Summary

## App Shape

- `src/app`: Next.js routes and pages
- `src/modules/auth`: auth config and guards
- `src/modules/ingest`: Gmail import pipeline
- `src/modules/listen`: listening-room queries, validation, player sync helpers, YouTube title lookup
- `src/modules/metrics`: formulas and query layer
- `src/db`: Postgres pool and migrations
- `scripts`: CLI jobs

## Listen Surfaces

- `/listen`: thumbnail-first playback UI with hidden YouTube iframe host for audio
- `/api/listen/queue`: add tracks after parsing and normalizing a YouTube URL
- `/api/listen/queue/[queueItemId]`: admin-only delete for queued or historical playlist items
- `/api/listen/playback`: admin transport control plus guarded track advance
- `/api/listen/heartbeat`: listener presence and current-track title snapshot updates

## Core Tables

- `users`
- `import_runs`
- `campaign_daily_metrics`
- `listening_rooms`
- `listening_room_queue_items`
- `listening_room_playback_state`
- `listening_room_presence`

## Current Listen Behavior

- title snapshots are fetched on queue add and refreshed from the active player heartbeat
- current track renders as thumbnail + metadata, not an inline video frame
- completed tracks remain in playlist history until an admin removes them
- next queued track is selected randomly from the remaining pending items
