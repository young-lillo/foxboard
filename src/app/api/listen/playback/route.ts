import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { LISTENING_ROOM_ID } from "@/modules/listen/constants";
import { getSessionRole } from "@/modules/auth/session-role";
import { advanceQueueItem } from "@/modules/listen/queries/advance-queue-item";
import { getListeningRoomState } from "@/modules/listen/queries/get-listening-room-state";
import { updatePlaybackState } from "@/modules/listen/queries/update-playback-state";
import { playbackActionSchema } from "@/modules/listen/schemas";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = playbackActionSchema.parse(await request.json());
    const canAdvanceCurrent =
      body.action === "advance-if-current" && !!body.expectedQueueItemId;

    if (!canAdvanceCurrent && getSessionRole(session) !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.action === "play" || body.action === "pause") {
      await updatePlaybackState({
        roomId: LISTENING_ROOM_ID,
        userId: session.user.id,
        action: body.action,
        positionSeconds: body.positionSeconds
      });
    } else {
      await advanceQueueItem({
        roomId: LISTENING_ROOM_ID,
        userId: session.user.id,
        action: body.action,
        expectedQueueItemId: body.expectedQueueItemId
      });
    }

    const state = await getListeningRoomState();
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    throw error;
  }
}
