import { parseYoutubeVideoUrl } from "@/modules/listen/parse-youtube-video-url";

describe("parseYoutubeVideoUrl", () => {
  it("accepts canonical watch urls", () => {
    expect(
      parseYoutubeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toEqual({
      videoId: "dQw4w9WgXcQ",
      canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    });
  });

  it("accepts short urls", () => {
    expect(
      parseYoutubeVideoUrl("https://youtu.be/dQw4w9WgXcQ?t=43")
    ).toEqual({
      videoId: "dQw4w9WgXcQ",
      canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    });
  });

  it("rejects playlist links", () => {
    expect(() =>
      parseYoutubeVideoUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL1234567890"
      )
    ).toThrow("Only single YouTube video URLs are supported");
  });

  it("rejects unsupported hosts and paths", () => {
    expect(() =>
      parseYoutubeVideoUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")
    ).toThrow("Only single YouTube video URLs are supported");

    expect(() => parseYoutubeVideoUrl("https://vimeo.com/123456")).toThrow(
      "Only single YouTube video URLs are supported"
    );
  });
});
