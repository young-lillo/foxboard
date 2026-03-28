import { fetchYoutubeVideoTitle } from "@/modules/listen/fetch-youtube-video-title";
import { ListeningRoomQueueItem } from "@/modules/listen/types";
import { updateQueueItemTitle } from "@/modules/listen/queries/update-queue-item-title";

const TITLE_RETRY_WINDOW_MS = 5 * 60 * 1000;
const MAX_HYDRATION_ATTEMPTS = 3;
const recentAttempts = new Map<string, number>();

export async function hydrateMissingTitleSnapshots(
  items: ListeningRoomQueueItem[]
) {
  const hydratedTitles = new Map<string, string>();
  const candidates = items
    .filter((item) => !item.titleSnapshot?.trim())
    .filter((item) => shouldAttempt(item.id))
    .slice(0, MAX_HYDRATION_ATTEMPTS);

  await Promise.all(
    candidates.map(async (item) => {
      markAttempt(item.id);

      const titleSnapshot = await fetchYoutubeVideoTitle(item.sourceUrl);

      if (!titleSnapshot) {
        return;
      }

      await updateQueueItemTitle({
        roomId: item.roomId,
        queueItemId: item.id,
        titleSnapshot
      });
      recentAttempts.delete(item.id);
      hydratedTitles.set(item.id, titleSnapshot);
    })
  );

  return hydratedTitles;
}

function shouldAttempt(queueItemId: string) {
  const attemptedAt = recentAttempts.get(queueItemId);

  return !attemptedAt || Date.now() - attemptedAt > TITLE_RETRY_WINDOW_MS;
}

function markAttempt(queueItemId: string) {
  recentAttempts.set(queueItemId, Date.now());
}
