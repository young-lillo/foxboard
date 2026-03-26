create index if not exists idx_campaign_daily_metrics_needs_check_date
  on campaign_daily_metrics (needs_check, metric_date desc);

create index if not exists idx_campaign_daily_metrics_campaign_date
  on campaign_daily_metrics (campaign, metric_date desc);

create index if not exists idx_campaign_daily_metrics_adgroup_date
  on campaign_daily_metrics (adgroup, metric_date desc);

create index if not exists idx_import_runs_status_created_at
  on import_runs (status, created_at desc);
