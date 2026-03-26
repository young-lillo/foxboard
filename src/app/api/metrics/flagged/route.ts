import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { parseMetricsFilters } from "@/modules/metrics/filters";
import { getFlaggedAdgroups } from "@/modules/metrics/queries/get-flagged-adgroups";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = parseMetricsFilters(Object.fromEntries(request.nextUrl.searchParams));
    const rows = await getFlaggedAdgroups(filters);

    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    throw error;
  }
}
