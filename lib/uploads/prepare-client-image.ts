import {
  type AllowedImageContentType,
  resolveImageContentType,
} from "@/lib/validations/upload";

const COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

function replaceExtension(filename: string, extension: string) {
  const base = filename.replace(/\.[^.]+$/, "") || "upload";
  return `${base}.${extension}`;
}

async function loadImageSource(
  file: File,
): Promise<{ source: CanvasImageSource; cleanup?: () => void }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      cleanup: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new window.Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not read this image file."));
    element.src = objectUrl;
  });

  return {
    source: image,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
}

function getImageDimensions(source: CanvasImageSource) {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth,
      height: source.naturalHeight,
    };
  }

  if (source instanceof ImageBitmap) {
    return {
      width: source.width,
      height: source.height,
    };
  }

  if (source instanceof HTMLCanvasElement) {
    return {
      width: source.width,
      height: source.height,
    };
  }

  throw new Error("Could not read this image file.");
}

async function compressImageFile(file: File): Promise<File> {
  const { source, cleanup } = await loadImageSource(file);

  try {
    const { width, height } = getImageDimensions(source);
    const largestSide = Math.max(width, height);
    const scale =
      largestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / largestSide : 1;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) {
      return file;
    }

    return new File([blob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    cleanup?.();
  }
}

export async function prepareImageForUpload(file: File): Promise<{
  file: File;
  contentType: AllowedImageContentType;
}> {
  const contentType = resolveImageContentType(file);
  if (!contentType) {
    throw new Error("Unsupported image type.");
  }

  if (contentType === "image/gif" || file.size <= COMPRESS_THRESHOLD_BYTES) {
    return { file, contentType };
  }

  try {
    const compressed = await compressImageFile(file);
    return {
      file: compressed,
      contentType: "image/jpeg",
    };
  } catch {
    return { file, contentType };
  }
}
