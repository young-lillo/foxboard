export type Role = "admin" | "viewer";

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
};

export type ImportRunRecord = {
  id: string;
  gmailMessageId: string;
  sourceUrl: string;
  sourceHost: string;
  fileHash: string;
  filePath: string | null;
  reportReceivedAt: string;
  status: "pending" | "downloaded" | "imported" | "failed";
  rowCount: number;
  importedRowCount: number;
  errorMessage: string | null;
  createdAt: string;
};

export type DailyMetricRecord = {
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
