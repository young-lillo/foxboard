import { pool } from "@/db/pool";

type RemoveQueueItemInput = {
  roomId: string;
  queueItemId: string;
};

export async function removeQueueItem(input: RemoveQueueItemInput) {
  const result = await pool.query(
    `
      delete from listening_room_queue_items
      where id = $1
        and room_id = $2
        and status <> 'playing'
      returning id
    `,
    [input.queueItemId, input.roomId]
  );

  return (result.rowCount ?? 0) > 0;
}
