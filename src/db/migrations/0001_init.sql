create table if not exists users (
  id text primary key,
  email text not null unique,
  name text,
  image text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists import_runs (
  id text primary key,
  gmail_message_id text not null unique,
  gmail_thread_id text,
  source_url text not null,
  source_host text not null,
  file_hash text not null,
  file_path text,
  report_received_at timestamptz not null,
  status text not null check (status in ('pending', 'downloaded', 'imported', 'failed')),
  row_count integer not null default 0,
  imported_row_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaign_daily_metrics (
  id text primary key,
  import_run_id text not null references import_runs(id) on delete cascade,
  metric_date date not null,
  campaign text not null,
  adgroup text not null,
  contract text not null,
  impressions numeric(18, 4) not null default 0,
  bids numeric(18, 4) not null default 0,
  total_bid_amounts numeric(18, 4) not null default 0,
  media_cost numeric(18, 4) not null default 0,
  bid_cpm numeric(18, 4) not null default 0,
  media_cpm numeric(18, 4) not null default 0,
  needs_check boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(metric_date, campaign, adgroup, contract)
);
