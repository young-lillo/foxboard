import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { parseMetricsFilters } from "@/modules/metrics/filters";
import { getAdgroupHistory } from "@/modules/metrics/queries/get-adgroup-history";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const filters = parseMetricsFilters(Object.fromEntries(request.nextUrl.searchParams));
    const rows = await getAdgroupHistory(filters);

    return NextResponse.json(rows);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    throw error;
  }
}
