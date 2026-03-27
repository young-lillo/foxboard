export const COLUMN_ALIASES = {
  metricDate: ["Date"],
  campaign: ["Campaign"],
  adgroup: ["Adgroup", "Ad Group"],
  contract: ["Contract", "Inventory Contract"],
  impressions: ["Impressions"],
  bids: ["Bids"],
  totalBidAmounts: ["Total Bid Amounts", "Total Bid Amount (Adv Currency)"],
  mediaCost: ["Media Cost", "Media Cost (Adv Currency)"]
} as const;

export const REQUIRED_FIELDS = Object.keys(COLUMN_ALIASES) as Array<keyof typeof COLUMN_ALIASES>;
