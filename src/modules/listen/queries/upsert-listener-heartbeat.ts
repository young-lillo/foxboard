import { pool } from "@/db/pool";

type UpsertListenerHeartbeatInput = {
  roomId: string;
  userId: string;
};

export async function upsertListenerHeartbeat(input: UpsertListenerHeartbeatInput) {
  await pool.query(
    `
      insert into listening_room_presence (room_id, user_id, last_seen_at)
      values ($1, $2, now())
      on conflict (room_id, user_id)
      do update set last_seen_at = excluded.last_seen_at
    `,
    [input.roomId, input.userId]
  );
}
