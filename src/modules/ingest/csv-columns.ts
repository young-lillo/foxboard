export const COLUMN_ALIASES = {
  advertiser: ["Advertiser"],
  metricDate: ["Date"],
  campaign: ["Campaign"],
  adgroup: ["Adgroup", "Ad Group"],
  contract: ["Contract", "Inventory Contract"],
  impressions: ["Impressions"],
  bids: ["Bids"],
  totalBidAmounts: ["Total Bid Amounts", "Total Bid Amount (Adv Currency)"],
  mediaCost: ["Media Cost", "Media Cost (Adv Currency)"]
} as const;

export const REQUIRED_FIELDS = [
  "metricDate",
  "campaign",
  "adgroup",
  "contract",
  "impressions",
  "bids",
  "totalBidAmounts",
  "mediaCost"
] as const;

export const OPTIONAL_FIELDS = ["advertiser"] as const;
