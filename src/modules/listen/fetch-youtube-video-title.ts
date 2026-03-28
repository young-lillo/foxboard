export async function fetchYoutubeVideoTitle(sourceUrl: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(sourceUrl)}`,
      {
        headers: {
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(2500)
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { title?: unknown };
    const title = typeof payload.title === "string" ? payload.title.trim() : "";

    return title || null;
  } catch {
    return null;
  }
}
