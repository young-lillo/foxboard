import {
  getListeningItemTitle,
  ListeningRoomSnapshot
} from "@/modules/listen/types";

type NowPlayingCardProps = {
  currentItem: ListeningRoomSnapshot["playback"]["currentItem"];
  listenerCount: number;
  playbackStatus: ListeningRoomSnapshot["playback"]["playbackStatus"];
  hasJoined: boolean;
  isAdmin: boolean;
  onJoin: () => void;
  onPause: () => void;
  onPlay: () => void;
  onSkip: () => void;
};

function getStatusLabel(status: ListeningRoomSnapshot["playback"]["playbackStatus"]) {
  if (status === "playing") {
    return "Live";
  }

  if (status === "paused") {
    return "Paused";
  }

  return "Idle";
}

export function NowPlayingCard(props: NowPlayingCardProps) {
  return (
    <section className="card stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <p className="muted" style={{ margin: 0 }}>
            Listening room
          </p>
          <h1 style={{ margin: "6px 0 0" }}>Now playing</h1>
        </div>
        <div className="row">
          <span className="chip">{props.listenerCount} listening</span>
          <span className="chip">{getStatusLabel(props.playbackStatus)}</span>
        </div>
      </div>
      {props.currentItem ? (
        <div className="stack" style={{ gap: 8 }}>
          <strong>{getListeningItemTitle(props.currentItem)}</strong>
          <span className="muted">Added by {props.currentItem.addedByDisplayName}</span>
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          Queue is ready. Add a song, then an admin can start playback.
        </p>
      )}
      <div className="row">
        {!props.hasJoined ? (
          <button className="button" onClick={props.onJoin} type="button">
            Join and unmute
          </button>
        ) : null}
        {props.isAdmin ? (
          <>
            <button className="button" onClick={props.onPlay} type="button">
              Play
            </button>
            <button className="button button-secondary" onClick={props.onPause} type="button">
              Pause
            </button>
            <button className="button button-secondary" onClick={props.onSkip} type="button">
              Skip
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}
