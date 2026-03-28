import { withTransaction } from "@/db/sql";
import { resolveAdvanceTransition } from "@/modules/listen/playback-state";
import { ListeningPlaybackStatus } from "@/modules/listen/types";

type PlaybackStateRow = {
  currentQueueItemId: string | null;
  playbackStatus: ListeningPlaybackStatus;
};

type AdvanceQueueItemInput = {
  roomId: string;
  userId: string;
  action: "skip" | "advance-if-current";
  expectedQueueItemId?: string;
};

export async function advanceQueueItem(input: AdvanceQueueItemInput) {
  return withTransaction(async (client) => {
    const stateResult = await client.query<PlaybackStateRow>(
      `
        select
          current_queue_item_id as "currentQueueItemId",
          playback_status as "playbackStatus"
        from listening_room_playback_state
        where room_id = $1
        for update
      `,
      [input.roomId]
    );

    const state = stateResult.rows[0];

    if (!state?.currentQueueItemId) {
      return { changed: false };
    }

    if (
      input.expectedQueueItemId &&
      input.expectedQueueItemId !== state.currentQueueItemId
    ) {
      return { changed: false };
    }

    const nextQueueResult = await client.query<{ id: string }>(
      `
        select id
        from listening_room_queue_items
        where room_id = $1
          and status = 'queued'
        order by random()
        limit 1
        for update
      `,
      [input.roomId]
    );

    const nextQueueItemId = nextQueueResult.rows[0]?.id ?? null;

    await client.query(
      `
        update listening_room_queue_items
        set
          status = $2,
          updated_at = now()
        where id = $1
      `,
      [state.currentQueueItemId, input.action === "skip" ? "skipped" : "played"]
    );

    if (nextQueueItemId) {
      await client.query(
        `
          update listening_room_queue_items
          set
            status = 'playing',
            updated_at = now()
          where id = $1
        `,
        [nextQueueItemId]
      );
    }

    const nextState = resolveAdvanceTransition({
      action: input.action,
      currentQueueItemId: state.currentQueueItemId,
      currentPlaybackStatus: state.playbackStatus,
      nextQueueItemId,
      now: new Date().toISOString()
    });

    await client.query(
      `
        update listening_room_playback_state
        set
          current_queue_item_id = $2,
          playback_status = $3,
          anchor_position_seconds = $4,
          anchor_started_at = $5,
          updated_by_user_id = $6,
          updated_at = now()
        where room_id = $1
      `,
      [
        input.roomId,
        nextState.currentQueueItemId,
        nextState.playbackStatus,
        nextState.anchorPositionSeconds,
        nextState.anchorStartedAt,
        input.userId
      ]
    );

    return {
      changed: true,
      ...nextState
    };
  });
}
