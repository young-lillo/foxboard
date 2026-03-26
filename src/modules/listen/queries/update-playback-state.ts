import { withTransaction } from "@/db/sql";
import { resolvePlaybackTransition } from "@/modules/listen/playback-state";

type PlaybackStateRow = {
  currentQueueItemId: string | null;
};

type UpdatePlaybackStateInput = {
  roomId: string;
  userId: string;
  action: "play" | "pause";
  positionSeconds?: number;
};

export async function updatePlaybackState(input: UpdatePlaybackStateInput) {
  return withTransaction(async (client) => {
    const stateResult = await client.query<PlaybackStateRow>(
      `
        select current_queue_item_id as "currentQueueItemId"
        from listening_room_playback_state
        where room_id = $1
        for update
      `,
      [input.roomId]
    );

    const state = stateResult.rows[0];

    if (!state) {
      throw new Error("Listening room playback state is missing");
    }

    let currentQueueItemId = state.currentQueueItemId;

    if (input.action === "play" && !currentQueueItemId) {
      const queueResult = await client.query<{ id: string }>(
        `
          select id
          from listening_room_queue_items
          where room_id = $1
            and status = 'queued'
          order by sort_order asc
          limit 1
          for update
        `,
        [input.roomId]
      );

      currentQueueItemId = queueResult.rows[0]?.id ?? null;

      if (currentQueueItemId) {
        await client.query(
          `
            update listening_room_queue_items
            set status = 'playing', updated_at = now()
            where id = $1
          `,
          [currentQueueItemId]
        );
      }
    }

    const nextState = resolvePlaybackTransition({
      action: input.action,
      currentQueueItemId,
      positionSeconds: input.positionSeconds,
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
        currentQueueItemId,
        nextState.playbackStatus,
        nextState.anchorPositionSeconds,
        nextState.anchorStartedAt,
        input.userId
      ]
    );

    return {
      currentQueueItemId,
      ...nextState
    };
  });
}
