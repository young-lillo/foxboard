update campaign_daily_metrics as dash
set import_run_id = blank.import_run_id,
    impressions = blank.impressions,
    bids = blank.bids,
    total_bid_amounts = blank.total_bid_amounts,
    media_cost = blank.media_cost,
    bid_cpm = blank.bid_cpm,
    media_cpm = blank.media_cpm,
    needs_check = blank.needs_check,
    updated_at = now()
from campaign_daily_metrics as blank
where dash.metric_date = blank.metric_date
  and dash.campaign = blank.campaign
  and dash.adgroup = blank.adgroup
  and dash.contract = '-'
  and btrim(blank.contract) = '';

delete from campaign_daily_metrics as blank
using campaign_daily_metrics as dash
where dash.metric_date = blank.metric_date
  and dash.campaign = blank.campaign
  and dash.adgroup = blank.adgroup
  and dash.contract = '-'
  and btrim(blank.contract) = '';

update campaign_daily_metrics
set contract = '-',
    updated_at = now()
where btrim(contract) = '';
