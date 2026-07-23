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

const CONTENT_TYPE_EXTENSIONS: Record<AllowedImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const EXTENSION_CONTENT_TYPES: Record<string, AllowedImageContentType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function extensionForContentType(contentType: string) {
  return CONTENT_TYPE_EXTENSIONS[contentType as AllowedImageContentType] ?? null;
}

export function isAllowedImageContentType(
  contentType: string,
): contentType is AllowedImageContentType {
  return ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as AllowedImageContentType);
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
