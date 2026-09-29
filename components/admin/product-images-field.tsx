"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Film, ImagePlus, Loader2, Play, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  inferProductMediaKind,
  videoPreviewSrc,
  type ProductMediaItem,
} from "@/lib/products/media";
import {
  fetchUploadConfig,
  uploadProductMediaFiles,
  type UploadConfig,
} from "@/lib/uploads/client-image-upload";
import {
  formatMaxUploadSize,
  resolveImageContentType,
  resolveVideoContentType,
} from "@/lib/validations/upload";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  label?: string;
  value?: ProductMediaItem[];
  productName?: string;
  onUploadingChange?: (uploading: boolean) => void;
};

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,image/*,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm";

function isProductMediaFile(file: File) {
  return Boolean(resolveImageContentType(file) || resolveVideoContentType(file));
}

export function ProductImagesField({
  name = "imagesPayload",
  label = "Product photos & videos",
  value = [],
  productName,
  onUploadingChange,
}: Props) {
  const mediaRef = useRef<ProductMediaItem[]>(value.filter((item) => item.url));
  const dragCounterRef = useRef(0);
  const [media, setMedia] = useState<ProductMediaItem[]>(value.filter((item) => item.url));
  const [urlInput, setUrlInput] = useState("");
  const [uploadConfig, setUploadConfig] = useState<UploadConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  useEffect(() => {
    let cancelled = false;

    async function loadUploadConfig() {
      try {
        const config = await fetchUploadConfig("admin");
        if (!cancelled) {
          setUploadConfig(config);
        }
      } catch (loadError) {
        if (!cancelled) {
          setUploadConfig({
            mode: "unavailable",
            available: false,
            useClientUpload: false,
            maxBytes: 50 * 1024 * 1024,
            message:
              loadError instanceof Error
                ? loadError.message
                : "File upload is not available right now. Paste a file URL instead.",
          });
        }
      } finally {
        if (!cancelled) {
          setConfigLoading(false);
        }
      }
    }

    void loadUploadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateMedia(next: ProductMediaItem[] | ((current: ProductMediaItem[]) => ProductMediaItem[])) {
    setMedia((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      mediaRef.current = resolved;
      return resolved;
    });
  }

  function addMediaItem(url: string, type = inferProductMediaKind(url)) {
    const trimmed = url.trim();
    if (!trimmed) return false;

    const current = mediaRef.current;
    if (current.some((item) => item.url === trimmed)) return false;

    updateMedia([...current, { url: trimmed, type }]);
    return true;
  }

  function addMediaItems(items: ProductMediaItem[]) {
    updateMedia((current) => {
      const next = [...current];

      for (const item of items) {
        const trimmed = item.url.trim();
        if (!trimmed) continue;
        if (!next.some((entry) => entry.url === trimmed)) {
          next.push({ url: trimmed, type: item.type });
        }
      }

      return next;
    });
  }

  function removeMedia(index: number) {
    updateMedia((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveMedia(index: number, direction: -1 | 1) {
    updateMedia((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function handleAddUrl() {
    setError(null);
    setNotice(null);

    if (!addMediaItem(urlInput)) {
      if (mediaRef.current.some((item) => item.url === urlInput.trim())) {
        setError("This file URL is already in the list.");
      }
      return;
    }

    setUrlInput("");
  }

  async function uploadFiles(files: File[]) {
    const accepted = files.filter(isProductMediaFile);
    if (accepted.length === 0) {
      setError("Drop or select photos (JPG, PNG, WebP, GIF) or videos (MP4, WebM).");
      return;
    }

    setError(null);
    setNotice(null);

    if (configLoading) {
      setError("Upload settings are still loading. Please try again in a moment.");
      return;
    }

    if (!uploadConfig?.available) {
      setError(
        uploadConfig?.message ?? "File upload is not configured. Paste file URLs instead.",
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: accepted.length });
    setNotice(`Preparing ${accepted.length} file${accepted.length === 1 ? "" : "s"}…`);

    try {
      const result = await uploadProductMediaFiles(accepted, "products", uploadConfig, {
        existingUrls: mediaRef.current.map((item) => item.url),
        target: "admin",
        onProgress: (current, total) => setUploadProgress({ current, total }),
      });

      if (result.uploaded.length > 0) {
        addMediaItems(result.uploaded);
      }

      const messages: string[] = [];

      if (result.uploaded.length > 0) {
        messages.push(
          `${result.uploaded.length} file${result.uploaded.length === 1 ? "" : "s"} uploaded.`,
        );
      }

      if (result.skipped > 0) {
        messages.push(
          `${result.skipped} duplicate file${result.skipped === 1 ? "" : "s"} skipped.`,
        );
      }

      if (files.length > accepted.length) {
        messages.push(
          `${files.length - accepted.length} unsupported file${files.length - accepted.length === 1 ? "" : "s"} ignored.`,
        );
      }

      if (result.errors.length > 0) {
        setError(result.errors.join(" "));
      }

      if (messages.length > 0) {
        setNotice(messages.join(" "));
      } else if (result.errors.length > 0) {
        setError(result.errors.join(" "));
      } else {
        setError("No files were uploaded.");
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounterRef.current += 1;
    if (!uploadDisabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!uploadDisabled) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (uploadDisabled) return;

    void uploadFiles(Array.from(event.dataTransfer.files));
  }

  async function handleBatchUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      setError("Could not read the selected files. Please try again.");
      return;
    }

    await uploadFiles(files);
  }

  const uploadDisabled = isUploading || configLoading || uploadConfig?.available === false;
  const primaryImageIndex = media.findIndex((item) => item.type === "image");
  const hasVideo = media.some((item) => item.type === "video");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          Upload photos and videos. The first photo is the catalog thumbnail. Videos play on
          the product page, where customers can open them larger and zoom photos.
        </p>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(media)} />

      <div
        className={cn(
          "space-y-4 rounded-lg border border-dashed p-4 transition-colors",
          isDragging && "border-primary bg-primary/5",
          uploadDisabled && "opacity-60",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {media.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {media.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="flex gap-3 rounded-lg border bg-card p-3"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                  {item.type === "video" ? (
                    <>
                      <video
                        src={videoPreviewSrc(item.url)}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={
                        productName
                          ? `${productName} ${index + 1}`
                          : `Product image ${index + 1}`
                      }
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {item.type === "video" ? "Video" : "Image"} {index + 1}
                    </p>
                    {index === primaryImageIndex ? (
                      <p className="inline-flex items-center gap-1 text-xs text-amber-700">
                        <Star className="h-3 w-3 fill-current" />
                        Catalog photo
                      </p>
                    ) : item.type === "video" ? (
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Film className="h-3 w-3" />
                        Gallery video
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Gallery image</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === 0 || isUploading}
                      onClick={() => moveMedia(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={index === media.length - 1 || isUploading}
                      onClick={() => moveMedia(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isUploading}
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragging ? "Drop photos or videos here" : "Drag and drop product photos or videos"}
            </p>
            <p className="text-xs text-muted-foreground">
              The first photo becomes the catalog thumbnail. Videos play in the gallery.
            </p>
          </div>
        )}

        <div className={cn("space-y-3", media.length > 0 && "border-t pt-4")}>
          <label
            className={cn(
              "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              uploadDisabled && "pointer-events-none cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="file"
              accept={ACCEPT}
              className="sr-only"
              multiple
              disabled={uploadDisabled}
              onChange={handleBatchUpload}
            />
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading {uploadProgress?.current ?? 0} of {uploadProgress?.total ?? 0}…
              </>
            ) : configLoading ? (
              "Checking upload…"
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                {media.length === 0 ? "Upload photos or videos" : "Add more photos or videos"}
              </>
            )}
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              value={urlInput}
              placeholder="Or paste a photo or video URL (https://…)"
              disabled={isUploading}
              onChange={(event) => {
                setError(null);
                setNotice(null);
                setUrlInput(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={isUploading || !urlInput.trim()}
              onClick={handleAddUrl}
            >
              Add URL
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {uploadConfig?.available
              ? `Drag and drop or select multiple files. JPG, PNG, WebP, GIF, MP4, or WebM up to ${formatMaxUploadSize(uploadConfig.maxBytes)} each.`
              : "File upload is not configured on this server. Paste photo or video URLs instead."}
          </p>

          {hasVideo && primaryImageIndex < 0 ? (
            <p className="text-xs text-amber-700">
              Add at least one photo so the catalog, cart, and social preview have an image.
              Videos still play on the product page.
            </p>
          ) : null}

          {uploadConfig && !uploadConfig.available && uploadConfig.message ? (
            <p className="text-xs text-amber-700">{uploadConfig.message}</p>
          ) : null}

          {notice ? <p className="text-xs text-emerald-700">{notice}</p> : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
