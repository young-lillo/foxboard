import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { LISTENING_ROOM_ID } from "@/modules/listen/constants";
import { getListeningRoomState } from "@/modules/listen/queries/get-listening-room-state";
import { removeQueueItem } from "@/modules/listen/queries/remove-queue-item";
import { getSessionRole } from "@/modules/auth/session-role";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ queueItemId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (getSessionRole(session) !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { queueItemId } = await context.params;
  const removed = await removeQueueItem({
    roomId: LISTENING_ROOM_ID,
    queueItemId
  });

  if (!removed) {
    return NextResponse.json({ error: "Queue item could not be removed" }, { status: 400 });
  }

  const state = await getListeningRoomState();
  return NextResponse.json(state);
}
