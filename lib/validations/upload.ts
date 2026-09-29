import { z } from "zod";

export const MAX_IMAGE_UPLOAD_BYTES = 50 * 1024 * 1024;
export const VERCEL_SERVER_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageContentType = (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];

export const ALLOWED_VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm"] as const;

export type AllowedVideoContentType = (typeof ALLOWED_VIDEO_CONTENT_TYPES)[number];

export type AllowedUploadContentType = AllowedImageContentType | AllowedVideoContentType;

const CONTENT_TYPE_EXTENSIONS: Record<AllowedUploadContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const EXTENSION_CONTENT_TYPES: Record<string, AllowedImageContentType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const VIDEO_EXTENSION_CONTENT_TYPES: Record<string, AllowedVideoContentType> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

export function extensionForContentType(contentType: string) {
  return CONTENT_TYPE_EXTENSIONS[contentType as AllowedUploadContentType] ?? null;
}

export function isAllowedImageContentType(
  contentType: string,
): contentType is AllowedImageContentType {
  return ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as AllowedImageContentType);
}

export function isAllowedVideoContentType(
  contentType: string,
): contentType is AllowedVideoContentType {
  return ALLOWED_VIDEO_CONTENT_TYPES.includes(contentType as AllowedVideoContentType);
}

export function isAllowedUploadContentType(
  contentType: string,
): contentType is AllowedUploadContentType {
  return isAllowedImageContentType(contentType) || isAllowedVideoContentType(contentType);
}

export function resolveImageContentType(file: Pick<File, "name" | "type">) {
  const normalized = file.type?.split(";")[0]?.trim().toLowerCase() ?? "";

  if (normalized && isAllowedImageContentType(normalized)) {
    return normalized;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "heic" || extension === "heif") {
    return null;
  }

  return EXTENSION_CONTENT_TYPES[extension] ?? null;
}

export function getUnsupportedImageTypeMessage(file: Pick<File, "name" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "heic" || extension === "heif") {
    return "HEIC photos are not supported. Choose a JPG/PNG image or paste an image URL.";
  }

  return "Unsupported image type. Use JPG, PNG, WebP, or GIF.";
}

export function resolveVideoContentType(file: Pick<File, "name" | "type">) {
  const normalized = file.type?.split(";")[0]?.trim().toLowerCase() ?? "";

  if (normalized && isAllowedVideoContentType(normalized)) {
    return normalized;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSION_CONTENT_TYPES[extension] ?? null;
}

export function getUnsupportedMediaTypeMessage(file: Pick<File, "name" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const normalized = file.type?.split(";")[0]?.trim().toLowerCase() ?? "";

  if (
    extension === "mov" ||
    extension === "avi" ||
    extension === "mkv" ||
    normalized === "video/quicktime" ||
    normalized.startsWith("video/")
  ) {
    return "This video format is not supported. Upload an MP4 or WebM file.";
  }

  return getUnsupportedImageTypeMessage(file);
}

export function resolveAdminUpload(file: Pick<File, "name" | "type">, folder: UploadFolder) {
  const imageType = resolveImageContentType(file);
  if (imageType) {
    return { ok: true as const, contentType: imageType, kind: "image" as const };
  }

  const videoType = resolveVideoContentType(file);
  if (videoType) {
    if (folder !== "products") {
      return {
        ok: false as const,
        error: "Videos can only be uploaded as product media.",
      };
    }

    return { ok: true as const, contentType: videoType, kind: "video" as const };
  }

  return { ok: false as const, error: getUnsupportedMediaTypeMessage(file) };
}

export function getMaxUploadBytesForMode(mode: "blob" | "r2" | "local" | "unavailable") {
  if (mode === "blob" || mode === "local") {
    return MAX_IMAGE_UPLOAD_BYTES;
  }

  // R2 via the Node route still goes through the serverless request body.
  if (process.env.VERCEL) {
    return VERCEL_SERVER_UPLOAD_MAX_BYTES;
  }

  return MAX_IMAGE_UPLOAD_BYTES;
}

export function formatMaxUploadSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.floor(bytes / (1024 * 1024))} MB`;
  }

  return `${Math.floor(bytes / 1024)} KB`;
}

export const uploadedImageUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("/uploads/") || z.string().url().safeParse(value).success,
    "Enter a valid uploaded image.",
  );

export const uploadFolderSchema = z.enum([
  "products",
  "variants",
  "brands",
  "categories",
  "orders",
]);

export type UploadFolder = z.infer<typeof uploadFolderSchema>;

export function allowedContentTypesForFolder(folder: UploadFolder) {
  if (folder === "products") {
    return [...ALLOWED_IMAGE_CONTENT_TYPES, ...ALLOWED_VIDEO_CONTENT_TYPES];
  }

  return [...ALLOWED_IMAGE_CONTENT_TYPES];
}
