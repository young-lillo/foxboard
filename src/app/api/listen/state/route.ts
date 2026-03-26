import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getListeningRoomState } from "@/modules/listen/queries/get-listening-room-state";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getListeningRoomState();
  return NextResponse.json(state);
}
