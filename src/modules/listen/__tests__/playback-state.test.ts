import {
  resolveAdvanceTransition,
  resolvePlaybackTransition
} from "@/modules/listen/playback-state";

describe("playback-state", () => {
  it("starts playback from the provided anchor", () => {
    expect(
      resolvePlaybackTransition({
        action: "play",
        currentQueueItemId: "queue-1",
        positionSeconds: 18.25,
        now: "2026-03-26T10:00:00.000Z"
      })
    ).toEqual({
      playbackStatus: "playing",
      anchorPositionSeconds: 18.25,
      anchorStartedAt: "2026-03-26T10:00:00.000Z"
    });
  });

  it("pauses without an active anchor clock", () => {
    expect(
      resolvePlaybackTransition({
        action: "pause",
        currentQueueItemId: "queue-1",
        positionSeconds: 41,
        now: "2026-03-26T10:00:00.000Z"
      })
    ).toEqual({
      playbackStatus: "paused",
      anchorPositionSeconds: 41,
      anchorStartedAt: null
    });
  });

  it("keeps next track paused on manual skip from a paused room", () => {
    expect(
      resolveAdvanceTransition({
        action: "skip",
        currentQueueItemId: "queue-1",
        currentPlaybackStatus: "paused",
        nextQueueItemId: "queue-2",
        now: "2026-03-26T10:00:00.000Z"
      })
    ).toEqual({
      playbackStatus: "paused",
      currentQueueItemId: "queue-2",
      anchorPositionSeconds: 0,
      anchorStartedAt: null
    });
  });

  it("starts the next track when advancing after a finish event", () => {
    expect(
      resolveAdvanceTransition({
        action: "advance-if-current",
        currentQueueItemId: "queue-1",
        currentPlaybackStatus: "playing",
        nextQueueItemId: "queue-2",
        now: "2026-03-26T10:00:00.000Z"
      })
    ).toEqual({
      playbackStatus: "playing",
      currentQueueItemId: "queue-2",
      anchorPositionSeconds: 0,
      anchorStartedAt: "2026-03-26T10:00:00.000Z"
    });
  });

  it("returns to idle when there is no next track", () => {
    expect(
      resolveAdvanceTransition({
        action: "skip",
        currentQueueItemId: "queue-1",
        currentPlaybackStatus: "playing",
        nextQueueItemId: null,
        now: "2026-03-26T10:00:00.000Z"
      })
    ).toEqual({
      playbackStatus: "idle",
      currentQueueItemId: null,
      anchorPositionSeconds: 0,
      anchorStartedAt: null
    });
  });
});
