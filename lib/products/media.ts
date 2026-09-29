export type ProductMediaKind = "image" | "video";

export type ProductMediaItem = {
  url: string;
  type: ProductMediaKind;
};

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

function extensionFromUrl(url: string) {
  const path = url.split(/[?#]/)[0] ?? "";
  return path.split(".").pop()?.toLowerCase() ?? "";
}

export function inferProductMediaKind(url: string): ProductMediaKind {
  return VIDEO_EXTENSIONS.has(extensionFromUrl(url)) ? "video" : "image";
}

export function videoContentTypeFromUrl(url: string) {
  const extension = extensionFromUrl(url);
  if (extension === "webm") return "video/webm";
  if (extension === "mov") return "video/quicktime";
  return "video/mp4";
}

/** Media fragment so browsers paint a preview frame instead of a blank box. */
export function videoPreviewSrc(url: string) {
  if (url.includes("#")) return url;
  return `${url}#t=0.1`;
}

export function parseProductMedia(payload?: string | null): ProductMediaItem[] {
  if (!payload) return [];

  try {
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) return [];

    const items: ProductMediaItem[] = [];

    for (const item of parsed) {
      if (typeof item === "string") {
        const url = item.trim();
        if (!url) continue;
        items.push({ url, type: inferProductMediaKind(url) });
        continue;
      }

      if (!item || typeof item !== "object" || typeof item.url !== "string") {
        continue;
      }

      const url = item.url.trim();
      if (!url) continue;

      const type =
        item.type === "video" || item.type === "image"
          ? item.type
          : inferProductMediaKind(url);

      items.push({ url, type });
    }

    return items;
  } catch {
    return [];
  }
}

export function parseProductImageUrls(payload?: string | null) {
  return parseProductMedia(payload).map((item) => item.url);
}
