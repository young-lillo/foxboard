import { z } from "zod";

const dateSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
);
const optionalStringSchema = z.preprocess(emptyStringToUndefined, z.string().optional());

const metricsFilterSchema = z.object({
  from: dateSchema,
  to: dateSchema,
  advertiser: optionalStringSchema,
  campaign: optionalStringSchema,
  adgroup: optionalStringSchema,
  contract: optionalStringSchema,
  flaggedOnly: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});

export type MetricsFilters = z.infer<typeof metricsFilterSchema>;

export function parseMetricsFilters(input: Record<string, string | string[] | undefined>) {
  const filters = metricsFilterSchema.parse(input);

  return {
    ...filters,
    from: filters.from ?? defaultMetricDateFrom(),
    to: filters.to ?? defaultMetricDateTo()
  };
}

export const importRunsFilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export function defaultMetricDateFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return date.toISOString().slice(0, 10);
}

export function defaultMetricDateTo() {
  return new Date().toISOString().slice(0, 10);
}

function emptyStringToUndefined(value: unknown) {
  return value === "" ? undefined : value;
}
