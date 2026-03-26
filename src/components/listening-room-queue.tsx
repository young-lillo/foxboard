import { ListeningRoomQueueItem } from "@/modules/listen/types";

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
              <strong>
                {index + 1}. {item.titleSnapshot ?? item.sourceUrl}
              </strong>
              <span className="muted">Added by {item.addedByDisplayName}</span>
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
