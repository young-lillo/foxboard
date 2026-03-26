import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { LISTENING_ROOM_ID } from "@/modules/listen/constants";
import {
  InvalidYoutubeUrlError,
  parseYoutubeVideoUrl
} from "@/modules/listen/parse-youtube-video-url";
import { addQueueItem } from "@/modules/listen/queries/add-queue-item";
import { getListeningRoomState } from "@/modules/listen/queries/get-listening-room-state";
import { queueSongSchema } from "@/modules/listen/schemas";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = queueSongSchema.parse(await request.json());
    const parsedUrl = parseYoutubeVideoUrl(body.url);

    await addQueueItem({
      roomId: LISTENING_ROOM_ID,
      youtubeVideoId: parsedUrl.videoId,
      sourceUrl: parsedUrl.canonicalUrl,
      addedByUserId: session.user.id
    });

    const state = await getListeningRoomState();
    return NextResponse.json(state, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (error instanceof InvalidYoutubeUrlError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
