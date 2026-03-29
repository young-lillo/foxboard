export type ReportRow = {
  advertiser: string;
  metricDate: string;
  campaign: string;
  adgroup: string;
  contract: string;
  impressions: number;
  bids: number;
  totalBidAmounts: number;
  mediaCost: number;
  bidCpm: number;
  mediaCpm: number;
  needsCheck: boolean;
};

export type GmailMessage = {
  id: string;
  threadId: string;
  internalDate: number;
  body: string;
};
