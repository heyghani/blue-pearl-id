"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchUploadConfig,
  uploadImageFiles,
  type UploadConfig,
} from "@/lib/uploads/client-image-upload";
import { MAX_PRODUCT_IMAGES } from "@/lib/validations/admin";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  label?: string;
  value?: string[];
  productName?: string;
  onUploadingChange?: (uploading: boolean) => void;
};

function formatMaxSize(bytes: number) {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}

export function ProductImagesField({
  name = "imagesPayload",
  label = "Product images",
  value = [],
  productName,
  onUploadingChange,
}: Props) {
  const imagesRef = useRef<string[]>(value.filter(Boolean));
  const [images, setImages] = useState<string[]>(value.filter(Boolean));
  const [urlInput, setUrlInput] = useState("");
  const [uploadConfig, setUploadConfig] = useState<UploadConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const remainingSlots = MAX_PRODUCT_IMAGES - images.length;

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

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
            maxBytes: 4 * 1024 * 1024,
            message:
              loadError instanceof Error
                ? loadError.message
                : "Image upload is not available right now. Paste an image URL instead.",
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

  function updateImages(next: string[] | ((current: string[]) => string[])) {
    setImages((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      imagesRef.current = resolved;
      return resolved;
    });
  }

  function addImage(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return false;

    const current = imagesRef.current;
    if (current.length >= MAX_PRODUCT_IMAGES) return false;
    if (current.includes(trimmed)) return false;

    updateImages([...current, trimmed]);
    return true;
  }

  function addImages(urls: string[]) {
    updateImages((current) => {
      const next = [...current];

      for (const url of urls) {
        const trimmed = url.trim();
        if (!trimmed || next.length >= MAX_PRODUCT_IMAGES) break;
        if (!next.includes(trimmed)) {
          next.push(trimmed);
        }
      }

      return next;
    });
  }

  function removeImage(index: number) {
    updateImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    updateImages((current) => {
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

    if (!addImage(urlInput)) {
      if (imagesRef.current.includes(urlInput.trim())) {
        setError("This image URL is already in the list.");
      }
      return;
    }

    setUrlInput("");
  }

  async function handleBatchUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      setError("Could not read the selected files. Please try again.");
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
        uploadConfig?.message ??
          "Image upload is not configured. Paste image URLs instead.",
      );
      return;
    }

    const slotsLeft = MAX_PRODUCT_IMAGES - imagesRef.current.length;
    const overflowCount = Math.max(0, files.length - slotsLeft);

    if (slotsLeft === 0) {
      setError(`Maximum of ${MAX_PRODUCT_IMAGES} images reached.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: Math.min(files.length, slotsLeft) });
    setNotice(`Preparing ${Math.min(files.length, slotsLeft)} image${Math.min(files.length, slotsLeft) === 1 ? "" : "s"}…`);

    try {
      const result = await uploadImageFiles(files, "products", uploadConfig, {
        maxCount: slotsLeft,
        existingUrls: imagesRef.current,
        target: "admin",
        onProgress: (current, total) => setUploadProgress({ current, total }),
      });

      if (result.uploaded.length > 0) {
        addImages(result.uploaded);
      }

      const messages: string[] = [];

      if (result.uploaded.length > 0) {
        messages.push(
          `${result.uploaded.length} image${result.uploaded.length === 1 ? "" : "s"} uploaded.`,
        );
      }

      if (overflowCount > 0) {
        messages.push(
          `${overflowCount} file${overflowCount === 1 ? "" : "s"} skipped (limit is ${MAX_PRODUCT_IMAGES}).`,
        );
      }

      if (result.skipped > 0) {
        messages.push(`${result.skipped} duplicate image${result.skipped === 1 ? "" : "s"} skipped.`);
      }

      if (result.errors.length > 0) {
        setError(result.errors.join(" "));
      }

      if (messages.length > 0) {
        setNotice(messages.join(" "));
      } else if (result.errors.length > 0) {
        setError(result.errors.join(" "));
      } else {
        setError("No images were uploaded.");
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  const uploadDisabled =
    isUploading || configLoading || uploadConfig?.available === false || remainingSlots === 0;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          Upload up to {MAX_PRODUCT_IMAGES} images at once. The first image is used as the primary
          catalog photo and gallery cover.
        </p>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="flex gap-3 rounded-lg border bg-card p-3"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                <img
                  src={url}
                  alt={productName ? `${productName} ${index + 1}` : `Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Image {index + 1}</p>
                  {index === 0 ? (
                    <p className="inline-flex items-center gap-1 text-xs text-amber-700">
                      <Star className="h-3 w-3 fill-current" />
                      Primary image
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
                    onClick={() => moveImage(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === images.length - 1 || isUploading}
                    onClick={() => moveImage(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isUploading}
                    onClick={() => removeImage(index)}
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
        <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          No images yet. Upload one or more product photos below.
        </p>
      )}

      {remainingSlots > 0 ? (
        <div className={cn("space-y-3", images.length > 0 && "border-t pt-4")}>
          <label
            className={cn(
              "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              uploadDisabled && "pointer-events-none cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/*,.jpg,.jpeg,.png,.webp,.gif"
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
                {images.length === 0 ? "Upload images" : "Add more images"}
              </>
            )}
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              value={urlInput}
              placeholder="Or paste an image URL (https://…)"
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
              ? `Select multiple files at once. JPG, PNG, WebP, or GIF up to ${formatMaxSize(uploadConfig.maxBytes)} each. ${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} remaining.`
              : "File upload is not configured on this server. Paste image URLs instead."}
          </p>

          {uploadConfig && !uploadConfig.available && uploadConfig.message ? (
            <p className="text-xs text-amber-700">{uploadConfig.message}</p>
          ) : null}

          {notice ? <p className="text-xs text-emerald-700">{notice}</p> : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Maximum of {MAX_PRODUCT_IMAGES} images reached.
        </p>
      )}

    </div>
  );
}
