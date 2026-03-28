import Image from "next/image";

import {
  getListeningItemTitle,
  getYoutubeThumbnailUrl,
  ListeningRoomQueueItem
} from "@/modules/listen/types";

export function ListeningRoomQueue({
  items,
  isAdmin,
  onRemove
}: {
  items: ListeningRoomQueueItem[];
  isAdmin: boolean;
  onRemove: (queueItemId: string) => Promise<void>;
}) {
  const queuedItems = items.filter((item) => item.status === "queued");
  const playedItems = items.filter((item) => item.status !== "queued");

  return (
    <section className="card stack">
      <div>
        <h2 style={{ margin: 0 }}>Playlist</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Shared queue, shuffled playback, and saved history for the room.
        </p>
      </div>
      {items.length ? (
        <div className="stack" style={{ gap: 18 }}>
          <QueueSection
            emptyMessage="Nothing queued yet."
            isAdmin={isAdmin}
            items={queuedItems}
            onRemove={onRemove}
            title="Queued pool"
          />
          <QueueSection
            emptyMessage="Played songs stay here until an admin removes them."
            isAdmin={isAdmin}
            items={playedItems}
            onRemove={onRemove}
            title="History"
          />
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          Nothing in the playlist yet.
        </p>
      )}
    </section>
  );
}

function QueueSection({
  title,
  items,
  isAdmin,
  onRemove,
  emptyMessage
}: {
  title: string;
  items: ListeningRoomQueueItem[];
  isAdmin: boolean;
  onRemove: (queueItemId: string) => Promise<void>;
  emptyMessage: string;
}) {
  return (
    <section className="stack" style={{ gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>{title}</strong>
        <span className="muted">{items.length}</span>
      </div>
      {items.length ? (
        items.map((item) => (
          <article className="queue-item" key={item.id}>
            <div className="queue-track">
              <Image
                alt={getListeningItemTitle(item)}
                className="queue-track__image"
                height={54}
                loading="lazy"
                src={getYoutubeThumbnailUrl(item.youtubeVideoId)}
                width={96}
              />
              <div className="stack queue-track__body" style={{ gap: 4 }}>
                <strong className="track-title">{getListeningItemTitle(item)}</strong>
                <span className="muted">Added by {item.addedByDisplayName}</span>
              </div>
              <div className="queue-track__actions">
                <span className="chip">{statusLabel(item.status)}</span>
                {isAdmin ? (
                  <button
                    className="button button-secondary button-compact"
                    onClick={() => void onRemove(item.id)}
                    type="button"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

function statusLabel(status: ListeningRoomQueueItem["status"]) {
  if (status === "queued") {
    return "Pending";
  }

  if (status === "skipped") {
    return "Skipped";
  }

  return "Played";
}
