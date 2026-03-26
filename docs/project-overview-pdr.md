# Project Overview PDR

## Problem

Team needs a fast internal app to detect adgroups where bid CPM is lower than media CPM from rolling 90-day CSV reports.

## MVP Scope

- auto-ingest Gmail report links
- store daily facts in Postgres
- Google Workspace login only
- flagged-first dashboard
- import history for admins
- one internal `/listen` room with shared queue and soft-sync playback

## Out Of Scope

- MCP
- realtime alerts
- heavy BI analytics
- multi-tenant support
- multi-room listening
