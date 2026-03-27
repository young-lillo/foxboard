"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { HEARTBEAT_INTERVAL_MS, LISTEN_POLL_INTERVAL_MS, PLAYER_DRIFT_TOLERANCE_SECONDS } from "@/modules/listen/constants";
import { fetchListeningRoomState, postListeningHeartbeat, postListeningRoomSnapshot } from "@/modules/listen/client-api";
import { ListeningRoomSnapshot } from "@/modules/listen/types";
import { useStableEvent } from "@/modules/listen/use-stable-event";
import { createYoutubePlayer, YoutubePlayerController } from "@/modules/listen/youtube-player";
import { Role } from "@/types";

function getExpectedPosition(state: ListeningRoomSnapshot, snapshotReceivedAt: number) {
  if (state.playback.playbackStatus !== "playing" || !state.playback.anchorStartedAt) {
    return state.playback.anchorPositionSeconds;
  }
  const serverElapsedSeconds =
    (Date.parse(state.serverNow) - Date.parse(state.playback.anchorStartedAt)) / 1000;
  const clientElapsedSeconds = (Date.now() - snapshotReceivedAt) / 1000;

  return Math.max(0, state.playback.anchorPositionSeconds + serverElapsedSeconds + clientElapsedSeconds);
}
export function useListeningRoomController(initialState: ListeningRoomSnapshot, role: Role) {
  const [roomState, setRoomState] = useState(initialState);
  const [hasJoined, setHasJoined] = useState(false);
  const [playerVolume, setPlayerVolume] = useState(100);
  const [statusMessage, setStatusMessage] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [isRefreshing, startTransition] = useTransition();
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YoutubePlayerController | null>(null);
  const loadedVideoIdRef = useRef<string | null>(null);
  const snapshotReceivedAtRef = useRef(Date.now());
  const applySnapshot = useStableEvent((snapshot: ListeningRoomSnapshot) => {
    snapshotReceivedAtRef.current = Date.now();
    setRoomState(snapshot);
  });
  const refreshState = useStableEvent(async () => {
    applySnapshot(await fetchListeningRoomState());
  });
  const mutateSnapshot = useStableEvent(
    async (url: string, body: Record<string, unknown>) => {
      const payload = await postListeningRoomSnapshot(url, body);
      if ("room" in payload) {
        applySnapshot(payload as ListeningRoomSnapshot);
      }
    }
  );
  const handleTrackEnded = useStableEvent(async () => {
    if (role !== "admin" || !roomState.playback.currentItem) {
      return;
    }
    await mutateSnapshot("/api/listen/playback", {
      action: "advance-if-current",
      expectedQueueItemId: roomState.playback.currentItem.id
    });
  });
  const syncPlayer = useStableEvent(async () => {
    if (!hasJoined || !playerHostRef.current) {
      return;
    }
    if (!playerRef.current) {
      playerRef.current = await createYoutubePlayer(playerHostRef.current, {
        initialVideoId: roomState.playback.currentItem?.youtubeVideoId ?? null,
        onEnded: () => {
          void handleTrackEnded();
        }
      });
      setPlayerVolume(playerRef.current.getVolume());
    }
    const currentItem = roomState.playback.currentItem;
    if (!currentItem) {
      loadedVideoIdRef.current = null;
      setPlayerError("");
      return;
    }
    const expectedPosition = getExpectedPosition(roomState, snapshotReceivedAtRef.current);
    if (loadedVideoIdRef.current !== currentItem.youtubeVideoId) {
      playerRef.current.load(
        currentItem.youtubeVideoId,
        expectedPosition,
        roomState.playback.playbackStatus === "playing"
      );
      loadedVideoIdRef.current = currentItem.youtubeVideoId;
      return;
    }
    const driftSeconds = Math.abs(playerRef.current.getCurrentTime() - expectedPosition);
    if (driftSeconds > PLAYER_DRIFT_TOLERANCE_SECONDS) {
      playerRef.current.seekTo(expectedPosition);
    }
    if (roomState.playback.playbackStatus === "playing") {
      playerRef.current.play();
      return;
    }
    playerRef.current.pause();
  });
  const sendHeartbeat = useStableEvent(async () => {
    if (!hasJoined) {
      return;
    }
    await postListeningHeartbeat({
      currentQueueItemId: roomState.playback.currentItem?.id,
      titleSnapshot: playerRef.current?.getTitle() ?? undefined
    });
  });
  useEffect(() => {
    startTransition(() => {
      void syncPlayer().catch((error) => {
        setPlayerError(error instanceof Error ? error.message : "Player failed to load");
      });
    });
  }, [
    hasJoined,
    roomState.playback.currentItem?.id,
    roomState.playback.currentItem?.youtubeVideoId,
    roomState.playback.playbackStatus,
    roomState.playback.anchorPositionSeconds,
    roomState.playback.anchorStartedAt,
    startTransition,
    syncPlayer
  ]);
  useEffect(() => {
    const poll = window.setInterval(() => {
      void refreshState().catch(() => undefined);
    }, LISTEN_POLL_INTERVAL_MS);
    const handleFocus = () => {
      void refreshState().catch(() => undefined);
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshState]);
  useEffect(() => {
    if (!hasJoined) {
      return;
    }
    void sendHeartbeat().catch(() => undefined);
    const heartbeat = window.setInterval(() => {
      void sendHeartbeat().catch(() => undefined);
    }, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(heartbeat);
  }, [hasJoined, sendHeartbeat]);
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
    };
  }, []);
  return {
    roomState,
    hasJoined,
    isRefreshing,
    playerError,
    playerVolume,
    playerHostRef,
    statusMessage,
    joinRoom() {
      setHasJoined(true);
    },
    async addSong(url: string) {
      await mutateSnapshot("/api/listen/queue", { url });
      setStatusMessage(
        role === "admin" ? "Queued. Press Play to start playback." : "Queued. Waiting for an admin to press Play."
      );
    },
    play() {
      startTransition(() => {
        void mutateSnapshot("/api/listen/playback", {
          action: "play",
          positionSeconds:
            playerRef.current?.getCurrentTime() ?? roomState.playback.anchorPositionSeconds
        }).catch((error) => {
          setStatusMessage(error instanceof Error ? error.message : "Play failed");
        });
      });
    },
    pause() {
      startTransition(() => {
        void mutateSnapshot("/api/listen/playback", {
          action: "pause",
          positionSeconds: playerRef.current?.getCurrentTime() ?? 0
        }).catch((error) => {
          setStatusMessage(error instanceof Error ? error.message : "Pause failed");
        });
      });
    },
    skip() {
      startTransition(() => {
        void mutateSnapshot("/api/listen/playback", {
          action: "skip",
          expectedQueueItemId: roomState.playback.currentItem?.id
        }).catch((error) => {
          setStatusMessage(error instanceof Error ? error.message : "Skip failed");
        });
      });
    },
    increaseVolume() {
      if (!playerRef.current) {
        return;
      }

      setPlayerVolume(playerRef.current.setVolume(playerVolume + 10));
    },
    decreaseVolume() {
      if (!playerRef.current) {
        return;
      }

      setPlayerVolume(playerRef.current.setVolume(playerVolume - 10));
    }
  };
}
