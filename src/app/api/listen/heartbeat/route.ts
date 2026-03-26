import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { LISTENING_ROOM_ID } from "@/modules/listen/constants";
import { upsertListenerHeartbeat } from "@/modules/listen/queries/upsert-listener-heartbeat";
import { updateQueueItemTitle } from "@/modules/listen/queries/update-queue-item-title";
import { heartbeatSchema } from "@/modules/listen/schemas";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = heartbeatSchema.parse(await request.json().catch(() => ({})));

    await upsertListenerHeartbeat({
      roomId: LISTENING_ROOM_ID,
      userId: session.user.id
    });

    if (body.currentQueueItemId && body.titleSnapshot) {
      await updateQueueItemTitle({
        roomId: LISTENING_ROOM_ID,
        queueItemId: body.currentQueueItemId,
        titleSnapshot: body.titleSnapshot
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    throw error;
  }
}
