const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export class InvalidYoutubeUrlError extends Error {}

function normalizeYoutubeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function getWatchVideoId(url: URL) {
  if (url.pathname !== "/watch") {
    return null;
  }

  if (url.searchParams.has("list")) {
    return null;
  }

  return url.searchParams.get("v");
}

function getShortVideoId(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);
  return segments.length === 1 ? segments[0] : null;
}

export function parseYoutubeVideoUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new InvalidYoutubeUrlError("Enter a valid YouTube video URL");
  }

  const host = normalizeYoutubeHost(url.hostname);
  const rawVideoId =
    host === "youtube.com" || host === "m.youtube.com"
      ? getWatchVideoId(url)
      : host === "youtu.be"
        ? getShortVideoId(url)
        : null;

  if (!rawVideoId || !VIDEO_ID_PATTERN.test(rawVideoId)) {
    throw new InvalidYoutubeUrlError("Only single YouTube video URLs are supported");
  }

  return {
    videoId: rawVideoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${rawVideoId}`
  };
}
