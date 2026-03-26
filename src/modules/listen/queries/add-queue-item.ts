import { randomUUID } from "node:crypto";

import { withTransaction } from "@/db/sql";
import { ListeningRoomQueueItem } from "@/modules/listen/types";

type AddQueueItemInput = {
  roomId: string;
  youtubeVideoId: string;
  sourceUrl: string;
  titleSnapshot?: string | null;
  addedByUserId: string;
};

type QueueRow = ListeningRoomQueueItem;

export async function addQueueItem(input: AddQueueItemInput) {
  return withTransaction(async (client) => {
    await client.query(
      `
        select id
        from listening_rooms
        where id = $1
        for update
      `,
      [input.roomId]
    );

    const result = await client.query<QueueRow>(
      `
        with next_sort_order as (
          select coalesce(max(sort_order), 0) + 1 as value
          from listening_room_queue_items
          where room_id = $1
        )
        insert into listening_room_queue_items (
          id,
          room_id,
          youtube_video_id,
          source_url,
          title_snapshot,
          added_by_user_id,
          status,
          sort_order
        )
        select
          $2,
          $1,
          $3,
          $4,
          $5,
          $6,
          'queued',
          next_sort_order.value
        from next_sort_order
        returning
          id,
          room_id as "roomId",
          youtube_video_id as "youtubeVideoId",
          source_url as "sourceUrl",
          title_snapshot as "titleSnapshot",
          added_by_user_id as "addedByUserId",
          '' as "addedByDisplayName",
          status,
          sort_order as "sortOrder",
          created_at as "createdAt"
      `,
      [
        input.roomId,
        randomUUID(),
        input.youtubeVideoId,
        input.sourceUrl,
        input.titleSnapshot ?? null,
        input.addedByUserId
      ]
    );

    return result.rows[0];
  });
}
