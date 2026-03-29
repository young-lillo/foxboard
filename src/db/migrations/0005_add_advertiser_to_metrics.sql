alter table campaign_daily_metrics
add column if not exists advertiser text not null default '-';

update campaign_daily_metrics
set advertiser = '-'
where coalesce(nullif(btrim(advertiser), ''), '') = '';

create index if not exists idx_campaign_daily_metrics_advertiser_date
  on campaign_daily_metrics (advertiser, metric_date desc);
