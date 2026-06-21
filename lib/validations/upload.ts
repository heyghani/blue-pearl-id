import { z } from "zod";

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

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

export function extensionForContentType(contentType: string) {
  return CONTENT_TYPE_EXTENSIONS[contentType as AllowedImageContentType] ?? null;
}

export function isAllowedImageContentType(
  contentType: string,
): contentType is AllowedImageContentType {
  return ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as AllowedImageContentType);
}

export const uploadedImageUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("/uploads/") || z.string().url().safeParse(value).success,
    "Enter a valid uploaded image.",
  );

export const uploadFolderSchema = z.enum(["products", "variants"]);
