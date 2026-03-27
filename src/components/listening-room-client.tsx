"use client";

import { AddSongForm } from "@/components/add-song-form";
import { ListeningRoomQueue } from "@/components/listening-room-queue";
import { NowPlayingCard } from "@/components/now-playing-card";
import { useListeningRoomController } from "@/modules/listen/use-listening-room-controller";
import { ListeningRoomSnapshot } from "@/modules/listen/types";
import { Role } from "@/types";

export function ListeningRoomClient({
  initialState,
  role
}: {
  initialState: ListeningRoomSnapshot;
  role: Role;
}) {
  const controller = useListeningRoomController(initialState, role);
  const currentItem = controller.roomState.playback.currentItem;
  const showPlayer = controller.hasJoined && !!currentItem;

  return (
    <section className="grid listen-grid">
      <div className="stack">
        <NowPlayingCard
          currentItem={currentItem}
          hasJoined={controller.hasJoined}
          isAdmin={role === "admin"}
          listenerCount={controller.roomState.listenerCount}
          onJoin={controller.joinRoom}
          onPause={controller.pause}
          onPlay={controller.play}
          onSkip={controller.skip}
          playbackStatus={controller.roomState.playback.playbackStatus}
        />
        <section className="card stack">
          <div ref={controller.playerHostRef} style={{ display: showPlayer ? undefined : "none" }} />
          {!controller.hasJoined ? (
            <p className="muted" style={{ margin: 0 }}>
              Join first so the browser can start audio reliably.
            </p>
          ) : !currentItem ? (
            <p className="muted" style={{ margin: 0 }}>
              Nothing is playing yet. Queued songs start here after an admin presses Play.
            </p>
          ) : null}
          {controller.isRefreshing ? (
            <p className="muted" style={{ margin: 0 }}>Syncing room...</p>
          ) : null}
          {controller.playerError ? (
            <p className="muted" style={{ margin: 0 }}>{controller.playerError}</p>
          ) : null}
          {controller.statusMessage ? (
            <p className="muted" style={{ margin: 0 }}>{controller.statusMessage}</p>
          ) : null}
        </section>
      </div>
      <div className="stack">
        <AddSongForm onAdd={controller.addSong} />
        <ListeningRoomQueue items={controller.roomState.queue} />
      </div>
    </section>
  );
}
