import Image from "next/image";

import {
  getListeningItemTitle,
  getYoutubeThumbnailUrl,
  ListeningRoomQueueItem
} from "@/modules/listen/types";

export function ListeningRoomQueue({ items }: { items: ListeningRoomQueueItem[] }) {
  return (
    <section className="card stack">
      <div>
        <h2 style={{ margin: 0 }}>Up next</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Shared queue for the single company room.
        </p>
      </div>
      {items.length ? (
        <div className="stack" style={{ gap: 12 }}>
          {items.map((item, index) => (
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
                <div className="stack" style={{ gap: 4 }}>
                  <strong className="track-title">
                    {index + 1}. {getListeningItemTitle(item)}
                  </strong>
                  <span className="muted">Added by {item.addedByDisplayName}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          Nothing queued yet.
        </p>
      )}
    </section>
  );
}
