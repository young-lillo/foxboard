import { pool } from "@/db/pool";
import {
  HEARTBEAT_FRESH_SECONDS,
  LISTENING_ROOM_SLUG
} from "@/modules/listen/constants";
import { hydrateMissingTitleSnapshots } from "@/modules/listen/hydrate-missing-title-snapshots";
import { ListeningRoomSnapshot } from "@/modules/listen/types";

type RoomRow = {
  id: string;
  slug: string;
  name: string;
  listenerCount: string;
  currentQueueItemId: string | null;
  playbackStatus: ListeningRoomSnapshot["playback"]["playbackStatus"];
  anchorPositionSeconds: string;
  anchorStartedAt: string | null;
  updatedAt: string;
  serverNow: string;
};

type QueueRow = {
  id: string;
  roomId: string;
  youtubeVideoId: string;
  sourceUrl: string;
  titleSnapshot: string | null;
  addedByUserId: string;
  addedByDisplayName: string;
  status: ListeningRoomSnapshot["queue"][number]["status"];
  sortOrder: string;
  createdAt: string;
};

const PLAYLIST_HISTORY_LIMIT = 20;

export async function getListeningRoomState(): Promise<ListeningRoomSnapshot> {
  const roomResult = await pool.query<RoomRow>(
    `
      select
        room.id,
        room.slug,
        room.name,
        coalesce(present.listener_count, 0) as "listenerCount",
        state.current_queue_item_id as "currentQueueItemId",
        state.playback_status as "playbackStatus",
        state.anchor_position_seconds as "anchorPositionSeconds",
        state.anchor_started_at as "anchorStartedAt",
        state.updated_at as "updatedAt",
        now() as "serverNow"
      from listening_rooms room
      join listening_room_playback_state state on state.room_id = room.id
      left join (
        select room_id, count(*)::int as listener_count
        from listening_room_presence
        where last_seen_at >= now() - ($1 || ' seconds')::interval
        group by room_id
      ) present on present.room_id = room.id
      where room.slug = $2
    `,
    [String(HEARTBEAT_FRESH_SECONDS), LISTENING_ROOM_SLUG]
  );

  const room = roomResult.rows[0];

  if (!room) {
    throw new Error("Listening room is not initialized");
  }

  const queueResult = await pool.query<QueueRow>(
    `
      select
        item.id,
        item.room_id as "roomId",
        item.youtube_video_id as "youtubeVideoId",
        item.source_url as "sourceUrl",
        item.title_snapshot as "titleSnapshot",
        item.added_by_user_id as "addedByUserId",
        coalesce(nullif(users.name, ''), users.email) as "addedByDisplayName",
        item.status,
        item.sort_order as "sortOrder",
        item.created_at as "createdAt"
      from listening_room_queue_items item
      join users on users.id = item.added_by_user_id
      where item.room_id = $1
        and item.status in ('queued', 'playing')
      order by
        case when item.status = 'playing' then 0 else 1 end,
        item.sort_order asc
    `,
    [room.id]
  );

  const historyResult = await pool.query<QueueRow>(
    `
      select
        item.id,
        item.room_id as "roomId",
        item.youtube_video_id as "youtubeVideoId",
        item.source_url as "sourceUrl",
        item.title_snapshot as "titleSnapshot",
        item.added_by_user_id as "addedByUserId",
        coalesce(nullif(users.name, ''), users.email) as "addedByDisplayName",
        item.status,
        item.sort_order as "sortOrder",
        item.created_at as "createdAt"
      from listening_room_queue_items item
      join users on users.id = item.added_by_user_id
      where item.room_id = $1
        and item.status in ('played', 'skipped')
      order by item.updated_at desc, item.sort_order desc
      limit $2
    `,
    [room.id, PLAYLIST_HISTORY_LIMIT]
  );

  const queueItems = [...queueResult.rows, ...historyResult.rows].map((item) => ({
    ...item,
    sortOrder: Number(item.sortOrder)
  }));
  const hydratedTitles = await hydrateMissingTitleSnapshots(queueItems);
  const mergedQueueItems = queueItems.map((item) => ({
    ...item,
    titleSnapshot: hydratedTitles.get(item.id) ?? item.titleSnapshot
  }));

  const currentItem =
    mergedQueueItems.find((item) => item.id === room.currentQueueItemId) ?? null;

  return {
    room: {
      id: room.id,
      slug: room.slug,
      name: room.name
    },
    listenerCount: Number(room.listenerCount),
    serverNow: room.serverNow,
    playback: {
      roomId: room.id,
      currentQueueItemId: room.currentQueueItemId,
      playbackStatus: room.playbackStatus,
      anchorPositionSeconds: Number(room.anchorPositionSeconds),
      anchorStartedAt: room.anchorStartedAt,
      updatedAt: room.updatedAt,
      currentItem
    },
    queue: mergedQueueItems.filter((item) => item.id !== room.currentQueueItemId)
  };
}
