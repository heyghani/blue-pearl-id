"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchUploadConfig,
  uploadImageFile,
  type UploadConfig,
} from "@/lib/uploads/client-image-upload";
import { cn } from "@/lib/utils";
import {
  getUnsupportedImageTypeMessage,
  resolveImageContentType,
  type UploadFolder,
} from "@/lib/validations/upload";

type Props = {
  name?: string;
  label?: string;
  value?: string | null;
  onChange?: (url: string) => void;
  folder?: UploadFolder;
  compact?: boolean;
  className?: string;
};

function formatMaxSize(bytes: number) {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}

export function ImageUploadField({
  name,
  label = "Product image",
  value,
  onChange,
  folder = "products",
  compact = false,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentUrl, setCurrentUrl] = useState(value ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUploadConfig() {
      try {
        const config = await fetchUploadConfig();
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

  function updateUrl(url: string) {
    setCurrentUrl(url);
    onChange?.(url);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    setError(null);

    if (configLoading) {
      setError("Upload settings are still loading. Please try again in a moment.");
      return;
    }

    if (!uploadConfig) {
      setError("Upload settings are not available.");
      return;
    }

    if (!resolveImageContentType(file)) {
      setError(getUnsupportedImageTypeMessage(file));
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadImageFile(file, folder, uploadConfig);
      updateUrl(url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function clearImage() {
    updateUrl("");
    setError(null);
  }

  const uploadDisabled =
    isUploading || configLoading || uploadConfig?.available === false;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-sm font-medium">{label}</p> : null}

      {name ? <input type="hidden" name={name} value={currentUrl} /> : null}

      <div
        className={cn(
          "flex gap-3",
          compact ? "items-center" : "flex-col sm:flex-row sm:items-start",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border bg-muted/30",
            compact ? "h-16 w-16 shrink-0" : "h-36 w-full max-w-xs",
          )}
        >
          {currentUrl ? (
            // Use a plain img preview to avoid mobile browser crashes from large optimized srcsets.
            <img
              src={currentUrl}
              alt={label || "Uploaded image"}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImagePlus className={cn(compact ? "h-5 w-5" : "h-8 w-8")} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size={compact ? "sm" : "default"}
              disabled={uploadDisabled}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : configLoading ? (
                "Checking upload…"
              ) : currentUrl ? (
                "Replace image"
              ) : (
                "Upload image"
              )}
            </Button>

            {currentUrl ? (
              <Button
                type="button"
                variant="ghost"
                size={compact ? "sm" : "default"}
                disabled={isUploading}
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>

          {!compact ? (
            <div className="space-y-1">
              <Input
                type="url"
                value={currentUrl}
                placeholder="Or paste an image URL (https://…)"
                onChange={(event) => {
                  setError(null);
                  updateUrl(event.target.value);
                }}
              />
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {uploadConfig?.available
              ? `JPG, PNG, WebP, or GIF up to ${formatMaxSize(uploadConfig.maxBytes)}.`
              : "File upload is not configured on this server. Paste an image URL instead."}
          </p>

          {uploadConfig && !uploadConfig.available && uploadConfig.message ? (
            <p className="text-xs text-amber-700">{uploadConfig.message}</p>
          ) : null}

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
