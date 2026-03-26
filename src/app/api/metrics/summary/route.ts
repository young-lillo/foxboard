import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { parseMetricsFilters } from "@/modules/metrics/filters";
import { getCampaignSummary } from "@/modules/metrics/queries/get-campaign-summary";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = parseMetricsFilters(Object.fromEntries(request.nextUrl.searchParams));
    const summary = await getCampaignSummary(filters);

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    throw error;
  }
}
