import { fetchYoutubeVideoTitle } from "@/modules/listen/fetch-youtube-video-title";

describe("fetchYoutubeVideoTitle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the oEmbed title when available", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ title: "Queue Title" }), { status: 200 })
    );

    await expect(
      fetchYoutubeVideoTitle("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).resolves.toBe("Queue Title");
  });

  it("falls back to the watch page title when oEmbed is unavailable", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response("Not Found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          '<html><head><meta property="og:title" content="Watch Page Title"></head></html>',
          { status: 200 }
        )
      );

    await expect(
      fetchYoutubeVideoTitle("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).resolves.toBe("Watch Page Title");
  });

  it("returns null when neither source has a usable title", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response("Not Found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response("<html><head><title> - YouTube</title></head></html>", {
          status: 200
        })
      );

    await expect(
      fetchYoutubeVideoTitle("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).resolves.toBeNull();
  });
});
