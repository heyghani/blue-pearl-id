import {
  type AllowedImageContentType,
  resolveImageContentType,
} from "@/lib/validations/upload";

const COMPRESS_THRESHOLD_BYTES = 20 * 1024 * 1024;
const JPEG_QUALITY = 0.92;

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

/** Re-encode very large files without downscaling, so uploads stay within platform limits. */
async function compressImageFile(file: File): Promise<File> {
  const { source, cleanup } = await loadImageSource(file);

  try {
    const { width, height } = getImageDimensions(source);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(source, 0, 0, canvas.width, canvas.height);

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
