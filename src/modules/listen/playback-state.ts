import { ListeningPlaybackStatus } from "@/modules/listen/types";

type ResolvePlaybackTransitionInput = {
  action: "play" | "pause";
  currentQueueItemId: string | null;
  positionSeconds?: number;
  now: string;
};

type ResolveAdvanceTransitionInput = {
  action: "skip" | "advance-if-current";
  currentQueueItemId: string | null;
  currentPlaybackStatus: ListeningPlaybackStatus;
  nextQueueItemId: string | null;
  now: string;
};

export function resolvePlaybackTransition(input: ResolvePlaybackTransitionInput) {
  const anchorPositionSeconds = Math.max(0, input.positionSeconds ?? 0);

  if (!input.currentQueueItemId) {
    return {
      playbackStatus: "idle" as const,
      anchorPositionSeconds: 0,
      anchorStartedAt: null
    };
  }

  if (input.action === "play") {
    return {
      playbackStatus: "playing" as const,
      anchorPositionSeconds,
      anchorStartedAt: input.now
    };
  }

  return {
    playbackStatus: "paused" as const,
    anchorPositionSeconds,
    anchorStartedAt: null
  };
}

export function resolveAdvanceTransition(input: ResolveAdvanceTransitionInput) {
  if (!input.nextQueueItemId) {
    return {
      playbackStatus: "idle" as const,
      currentQueueItemId: null,
      anchorPositionSeconds: 0,
      anchorStartedAt: null
    };
  }

  if (input.action === "skip" && input.currentPlaybackStatus === "paused") {
    return {
      playbackStatus: "paused" as const,
      currentQueueItemId: input.nextQueueItemId,
      anchorPositionSeconds: 0,
      anchorStartedAt: null
    };
  }

  return {
    playbackStatus: "playing" as const,
    currentQueueItemId: input.nextQueueItemId,
    anchorPositionSeconds: 0,
    anchorStartedAt: input.now
  };
}
