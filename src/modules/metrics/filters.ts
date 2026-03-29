import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const metricsFilterSchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  advertiser: z.string().optional(),
  campaign: z.string().optional(),
  adgroup: z.string().optional(),
  contract: z.string().optional(),
  flaggedOnly: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

export type MetricsFilters = z.infer<typeof metricsFilterSchema>;

export function parseMetricsFilters(input: Record<string, string | string[] | undefined>) {
  return metricsFilterSchema.parse(input);
}

export const importRunsFilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
