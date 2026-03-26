create table if not exists listening_rooms (
  id text primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listening_room_queue_items (
  id text primary key,
  room_id text not null references listening_rooms(id) on delete cascade,
  youtube_video_id text not null,
  source_url text not null,
  title_snapshot text,
  added_by_user_id text not null references users(id) on delete restrict,
  status text not null check (status in ('queued', 'playing', 'played', 'skipped')),
  sort_order bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_listening_room_queue_items_room_sort_order
  on listening_room_queue_items (room_id, sort_order);

create index if not exists idx_listening_room_queue_items_room_status_sort
  on listening_room_queue_items (room_id, status, sort_order);

create table if not exists listening_room_playback_state (
  room_id text primary key references listening_rooms(id) on delete cascade,
  current_queue_item_id text references listening_room_queue_items(id) on delete set null,
  playback_status text not null check (playback_status in ('idle', 'playing', 'paused')),
  anchor_position_seconds numeric(10, 3) not null default 0,
  anchor_started_at timestamptz,
  updated_by_user_id text references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists listening_room_presence (
  room_id text not null references listening_rooms(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists idx_listening_room_presence_room_last_seen
  on listening_room_presence (room_id, last_seen_at desc);

insert into listening_rooms (id, slug, name)
values ('company-room', 'company-room', 'Company Listening Room')
on conflict (slug) do nothing;

insert into listening_room_playback_state (room_id, playback_status, anchor_position_seconds)
values ('company-room', 'idle', 0)
on conflict (room_id) do nothing;
