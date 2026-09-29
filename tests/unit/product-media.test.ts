import { describe, expect, it } from "vitest";

import { inferProductMediaKind, parseProductMedia } from "@/lib/products/media";

describe("product media", () => {
  it("keeps legacy image url lists as photos", () => {
    expect(parseProductMedia(JSON.stringify(["https://cdn.example.com/a.jpg"]))).toEqual([
      { url: "https://cdn.example.com/a.jpg", type: "image" },
    ]);
  });

  it("reads explicit video entries and infers video urls", () => {
    expect(
      parseProductMedia(
        JSON.stringify([
          { url: "https://cdn.example.com/a.jpg", type: "image" },
          { url: "https://cdn.example.com/clip.mp4", type: "video" },
          "https://cdn.example.com/other.webm",
        ]),
      ),
    ).toEqual([
      { url: "https://cdn.example.com/a.jpg", type: "image" },
      { url: "https://cdn.example.com/clip.mp4", type: "video" },
      { url: "https://cdn.example.com/other.webm", type: "video" },
    ]);
  });

  it("ignores invalid payloads", () => {
    expect(parseProductMedia("not-json")).toEqual([]);
    expect(parseProductMedia(JSON.stringify({ url: "https://cdn.example.com/a.jpg" }))).toEqual(
      [],
    );
  });

  it("detects video files from the url extension", () => {
    expect(inferProductMediaKind("https://cdn.example.com/clip.mp4?token=1")).toBe("video");
    expect(inferProductMediaKind("/uploads/products/photo.png")).toBe("image");
  });
});
