import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getSessionRole } from "@/modules/auth/session-role";
import { triggerGmailImport } from "@/modules/ingest/trigger-gmail-import";

export async function POST() {
  const session = await auth();

  if (!session?.user || getSessionRole(session) !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await triggerGmailImport();
  return NextResponse.json(result);
}
