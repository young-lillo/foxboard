import { pool } from "@/db/pool";

type UpdateQueueItemTitleInput = {
  roomId: string;
  queueItemId: string;
  titleSnapshot: string;
};

export async function updateQueueItemTitle(input: UpdateQueueItemTitleInput) {
  const result = await pool.query(
    `
      update listening_room_queue_items
      set
        title_snapshot = case
          when coalesce(nullif(title_snapshot, ''), '') = '' then $2
          else title_snapshot
        end,
        updated_at = now()
      where listening_room_queue_items.id = $1
        and listening_room_queue_items.room_id = $3
      returning title_snapshot as "titleSnapshot"
    `,
    [input.queueItemId, input.titleSnapshot, input.roomId]
  );

  return result.rows[0]?.titleSnapshot ?? null;
}
