const TITLE_REQUEST_TIMEOUT_MS = 5_000;
const WATCH_PAGE_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
};

export async function fetchYoutubeVideoTitle(sourceUrl: string) {
  const embeddedTitle = await fetchTitleFromOEmbed(sourceUrl);

  if (embeddedTitle) {
    return embeddedTitle;
  }

  return fetchTitleFromWatchPage(sourceUrl);
}

async function fetchTitleFromOEmbed(sourceUrl: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(sourceUrl)}`,
      {
        headers: {
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(TITLE_REQUEST_TIMEOUT_MS)
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

async function fetchTitleFromWatchPage(sourceUrl: string) {
  try {
    const response = await fetch(sourceUrl, {
      headers: WATCH_PAGE_HEADERS,
      signal: AbortSignal.timeout(TITLE_REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
      return null;
    }

    return extractTitleFromHtml(await response.text());
  } catch {
    return null;
  }
}

function extractTitleFromHtml(html: string) {
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1];
  const pageTitle = html
    .match(/<title>([^<]+)<\/title>/i)?.[1]
    ?.replace(/\s*-\s*YouTube\s*$/i, "")
    .trim();
  const title = decodeHtmlEntities((ogTitle || pageTitle || "").trim());

  return title || null;
}

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
