import { upload } from "@vercel/blob/client";

import { prepareImageForUpload } from "@/lib/uploads/prepare-client-image";
import {
  extensionForContentType,
  getUnsupportedImageTypeMessage,
  resolveImageContentType,
  type UploadFolder,
} from "@/lib/validations/upload";

const MULTIPART_UPLOAD_THRESHOLD_BYTES = 3 * 1024 * 1024;
const BATCH_UPLOAD_YIELD_MS = 50;

export type UploadConfig = {
  mode: "r2" | "blob" | "local" | "unavailable";
  available: boolean;
  useClientUpload: boolean;
  maxBytes: number;
  message: string | null;
};

export type UploadTarget = "admin" | "checkout";

function getUploadEndpoints(target: UploadTarget) {
  if (target === "checkout") {
    return {
      config: "/api/checkout/upload",
      server: "/api/checkout/upload",
      blob: "/api/checkout/upload/client",
    };
  }

  return {
    config: "/api/admin/upload",
    server: "/api/admin/upload",
    blob: "/api/admin/upload/client",
  };
}

function formatMaxSize(bytes: number) {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function uploadViaServer(
  file: File,
  folder: UploadFolder,
  target: UploadTarget,
) {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);

  const response = await fetch(getUploadEndpoints(target).server, {
    method: "POST",
    body,
    credentials: "same-origin",
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Upload failed.");
  }

  return payload.url;
}

async function uploadViaBlob(
  file: File,
  folder: UploadFolder,
  contentType: string,
  target: UploadTarget,
) {
  const extension = extensionForContentType(contentType);
  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  const pathname = `${folder}/${crypto.randomUUID()}.${extension}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: getUploadEndpoints(target).blob,
    contentType,
    multipart: file.size >= MULTIPART_UPLOAD_THRESHOLD_BYTES,
  });

  return blob.url;
}

export async function fetchUploadConfig(
  target: UploadTarget = "admin",
): Promise<UploadConfig> {
  const response = await fetch(getUploadEndpoints(target).config, {
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = (await response.json()) as UploadConfig & { error?: string };

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        target === "admin"
          ? "Your admin session expired. Please sign in again."
          : "Your checkout session expired. Please refresh the page.",
      );
    }

    throw new Error(payload.error ?? "Could not check upload settings.");
  }

  return payload;
}

export async function uploadImageFile(
  file: File,
  folder: UploadFolder,
  config: UploadConfig,
  target: UploadTarget = "admin",
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
    ? await uploadViaBlob(prepared.file, folder, prepared.contentType, target)
    : await uploadViaServer(prepared.file, folder, target);
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
    target?: UploadTarget;
  },
): Promise<BatchUploadResult> {
  const existing = new Set(options?.existingUrls ?? []);
  const uploaded: string[] = [];
  const errors: string[] = [];
  let skipped = 0;
  const target = options?.target ?? "admin";

  const maxCount = options?.maxCount ?? files.length;
  const queue = files.slice(0, maxCount);

  options?.onProgress?.(0, queue.length);

  for (let index = 0; index < queue.length; index += 1) {
    const file = queue[index];

    try {
      const url = await uploadImageFile(file, folder, config, target);

      if (existing.has(url) || uploaded.includes(url)) {
        skipped += 1;
      } else {
        uploaded.push(url);
        existing.add(url);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed.";
      errors.push(`${file.name}: ${message}`);
    }

    options?.onProgress?.(index + 1, queue.length);

    if (index < queue.length - 1) {
      await wait(BATCH_UPLOAD_YIELD_MS);
    }
  }

  return { uploaded, errors, skipped };
}
