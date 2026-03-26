type YoutubePlayerApi = {
  cueVideoById(config: { videoId: string; startSeconds?: number }): void;
  loadVideoById(config: { videoId: string; startSeconds?: number }): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getVideoData(): { title?: string };
  destroy(): void;
  unMute(): void;
  setVolume(volume: number): void;
};

type YoutubeNamespace = {
  Player: new (
    element: HTMLElement,
    config: {
      videoId?: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    }
  ) => YoutubePlayerApi;
  PlayerState: {
    ENDED: number;
  };
};

declare global {
  interface Window {
    YT?: YoutubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YoutubeNamespace> | null = null;

function loadYoutubeApi() {
  if (window.YT) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YoutubeNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    window.onYouTubeIframeAPIReady = () => {
      if (window.YT) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API failed to initialize"));
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Failed to load YouTube API"));
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export type YoutubePlayerController = {
  load(videoId: string, startSeconds: number, shouldPlay: boolean): void;
  play(): void;
  pause(): void;
  seekTo(seconds: number): void;
  getCurrentTime(): number;
  getTitle(): string | null;
  destroy(): void;
};

export async function createYoutubePlayer(
  element: HTMLElement,
  options: {
    initialVideoId?: string | null;
    onEnded?: () => void;
  }
) {
  const YT = await loadYoutubeApi();

  return new Promise<YoutubePlayerController>((resolve) => {
    const player = new YT.Player(element, {
      videoId: options.initialVideoId ?? undefined,
      playerVars: {
        autoplay: 0,
        controls: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          player.unMute();
          player.setVolume(100);

          resolve({
            load(videoId, startSeconds, shouldPlay) {
              if (shouldPlay) {
                player.loadVideoById({ videoId, startSeconds });
                return;
              }

              player.cueVideoById({ videoId, startSeconds });
            },
            play() {
              player.playVideo();
            },
            pause() {
              player.pauseVideo();
            },
            seekTo(seconds) {
              player.seekTo(seconds, true);
            },
            getCurrentTime() {
              return player.getCurrentTime();
            },
            getTitle() {
              return player.getVideoData().title?.trim() || null;
            },
            destroy() {
              player.destroy();
            }
          });
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            options.onEnded?.();
          }
        }
      }
    });
  });
}
