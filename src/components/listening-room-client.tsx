"use client";

import Image from "next/image";

import { AddSongForm } from "@/components/add-song-form";
import { ListeningRoomQueue } from "@/components/listening-room-queue";
import { NowPlayingCard } from "@/components/now-playing-card";
import { useListeningRoomController } from "@/modules/listen/use-listening-room-controller";
import {
  getListeningItemTitle,
  getYoutubeThumbnailUrl,
  ListeningRoomSnapshot
} from "@/modules/listen/types";
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
          <div aria-hidden className="listen-player-host" ref={controller.playerHostRef} />
          {!controller.hasJoined ? (
            <p className="muted" style={{ margin: 0 }}>
              Join first so the browser can start audio reliably.
            </p>
          ) : !currentItem ? (
            <p className="muted" style={{ margin: 0 }}>
              Nothing is playing yet. Queued songs start here after an admin presses Play.
            </p>
          ) : (
            <article className="listen-preview">
              <Image
                alt={getListeningItemTitle(currentItem)}
                className="listen-preview__image"
                height={360}
                loading="eager"
                src={getYoutubeThumbnailUrl(currentItem.youtubeVideoId)}
                width={640}
              />
              <div className="stack" style={{ gap: 10 }}>
                <strong className="track-title">{getListeningItemTitle(currentItem)}</strong>
                <span className="muted">Added by {currentItem.addedByDisplayName}</span>
                <div className="listen-volume-row">
                  <button
                    className="button button-secondary button-compact"
                    onClick={controller.decreaseVolume}
                    type="button"
                  >
                    Vol -
                  </button>
                  <span className="chip">Volume {controller.playerVolume}%</span>
                  <button
                    className="button button-secondary button-compact"
                    onClick={controller.increaseVolume}
                    type="button"
                  >
                    Vol +
                  </button>
                </div>
              </div>
            </article>
          )}
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
        <ListeningRoomQueue
          isAdmin={role === "admin"}
          items={controller.roomState.queue}
          onRemove={controller.removeSong}
        />
      </div>
    </section>
  );
}
