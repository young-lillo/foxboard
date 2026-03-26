import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { getSessionRole } from "@/modules/auth/session-role";
import { importRunsFilterSchema } from "@/modules/metrics/filters";
import { getImportRuns } from "@/modules/metrics/queries/get-import-runs";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || getSessionRole(session) !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { limit } = importRunsFilterSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    const runs = await getImportRuns(limit);

    return NextResponse.json(runs);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    throw error;
  }
}
