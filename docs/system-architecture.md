# System Architecture

## Runtime

- Next.js app process
- PostgreSQL database
- systemd timer for Gmail import
- Caddy reverse proxy

## Listening Room Runtime

1. Signed-in user opens `/listen`.
2. Server returns canonical room state from Postgres.
3. User clicks join to initialize the YouTube IFrame player.
4. Client uses the server anchor time to compute expected playback position.
5. Queue add fetches a YouTube title snapshot through the oEmbed endpoint when possible.
6. Client renders a thumbnail-first now-playing card while the hidden iframe handles audio.
7. Client polls room state and heartbeats listener presence plus active-track title snapshots.
8. Admin play, pause, and skip actions mutate canonical queue/playback rows.
9. Joined listeners can send guarded `advance-if-current` mutations on track end.
10. When playback advances, the server picks the next pending track in random order.

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

## Listening Room State

- `listening_rooms`: one seeded shared room
- `listening_room_queue_items`: queued, playing, played, skipped tracks
- `listening_room_playback_state`: current track anchor and room transport state
- `listening_room_presence`: heartbeat rows for active listener count

## Playlist Semantics

- current track lives in `listening_room_playback_state.current_queue_item_id`
- non-current items remain queryable as pending or history rows
- played tracks are retained instead of being deleted automatically
- admins can delete non-playing playlist rows through the queue delete API
