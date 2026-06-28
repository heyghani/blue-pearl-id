import { upload } from "@vercel/blob/client";

import { prepareImageForUpload } from "@/lib/uploads/prepare-client-image";
import {
  extensionForContentType,
  getUnsupportedImageTypeMessage,
  resolveImageContentType,
  type UploadFolder,
} from "@/lib/validations/upload";

const MULTIPART_UPLOAD_THRESHOLD_BYTES = 3 * 1024 * 1024;

export type UploadConfig = {
  mode: "r2" | "blob" | "local" | "unavailable";
  available: boolean;
  useClientUpload: boolean;
  maxBytes: number;
  message: string | null;
};

function formatMaxSize(bytes: number) {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}

async function uploadViaServer(file: File, folder: UploadFolder) {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body,
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Upload failed.");
  }

  return payload.url;
}

async function uploadViaBlob(file: File, folder: UploadFolder, contentType: string) {
  const extension = extensionForContentType(contentType);
  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  const pathname = `${folder}/${crypto.randomUUID()}.${extension}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload/client",
    contentType,
    multipart: file.size >= MULTIPART_UPLOAD_THRESHOLD_BYTES,
  });

  return blob.url;
}

export async function fetchUploadConfig(): Promise<UploadConfig> {
  const response = await fetch("/api/admin/upload");
  const payload = (await response.json()) as UploadConfig & { error?: string };

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your admin session expired. Please sign in again.");
    }

    throw new Error(payload.error ?? "Could not check upload settings.");
  }

  return payload;
}

export async function uploadImageFile(
  file: File,
  folder: UploadFolder,
  config: UploadConfig,
): Promise<string> {
  if (!config.available) {
    throw new Error(
      config.message ?? "Image upload is not configured. Paste an image URL instead.",
    );
  }

  if (!resolveImageContentType(file)) {
    throw new Error(getUnsupportedImageTypeMessage(file));
  }

  const prepared = await prepareImageForUpload(file);

  if (prepared.file.size > config.maxBytes) {
    throw new Error(
      `Image is too large after processing. Please use a file under ${formatMaxSize(config.maxBytes)}.`,
    );
  }

  return config.useClientUpload
    ? await uploadViaBlob(prepared.file, folder, prepared.contentType)
    : await uploadViaServer(prepared.file, folder);
}

export type BatchUploadResult = {
  uploaded: string[];
  errors: string[];
  skipped: number;
};

export async function uploadImageFiles(
  files: File[],
  folder: UploadFolder,
  config: UploadConfig,
  options?: {
    maxCount?: number;
    existingUrls?: string[];
    onProgress?: (current: number, total: number) => void;
  },
): Promise<BatchUploadResult> {
  const existing = new Set(options?.existingUrls ?? []);
  const uploaded: string[] = [];
  const errors: string[] = [];
  let skipped = 0;

  const maxCount = options?.maxCount ?? files.length;
  const queue = files.slice(0, maxCount);

  for (let index = 0; index < queue.length; index += 1) {
    options?.onProgress?.(index + 1, queue.length);

    const file = queue[index];

    try {
      const url = await uploadImageFile(file, folder, config);

      if (existing.has(url) || uploaded.includes(url)) {
        skipped += 1;
        continue;
      }

      uploaded.push(url);
      existing.add(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed.";
      errors.push(`${file.name}: ${message}`);
    }
  }

  return { uploaded, errors, skipped };
}
