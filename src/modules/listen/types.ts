export type ListeningPlaybackStatus = "idle" | "playing" | "paused";

export type ListeningQueueItemStatus = "queued" | "playing" | "played" | "skipped";

export type ListeningPlaybackAction = "play" | "pause" | "skip" | "advance-if-current";

export type ListeningRoomQueueItem = {
  id: string;
  roomId: string;
  youtubeVideoId: string;
  sourceUrl: string;
  titleSnapshot: string | null;
  addedByUserId: string;
  addedByDisplayName: string;
  status: ListeningQueueItemStatus;
  sortOrder: number;
  createdAt: string;
};

export type ListeningPlaybackState = {
  roomId: string;
  currentQueueItemId: string | null;
  playbackStatus: ListeningPlaybackStatus;
  anchorPositionSeconds: number;
  anchorStartedAt: string | null;
  updatedAt: string;
};

export type ListeningRoomSnapshot = {
  room: {
    id: string;
    slug: string;
    name: string;
  };
  listenerCount: number;
  serverNow: string;
  playback: ListeningPlaybackState & {
    currentItem: ListeningRoomQueueItem | null;
  };
  queue: ListeningRoomQueueItem[];
};
