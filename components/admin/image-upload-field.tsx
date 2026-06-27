"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  extensionForContentType,
  getUnsupportedImageTypeMessage,
  resolveImageContentType,
} from "@/lib/validations/upload";

type UploadConfig = {
  mode: "r2" | "blob" | "local" | "unavailable";
  available: boolean;
  useClientUpload: boolean;
  maxBytes: number;
  message: string | null;
};

type Props = {
  name?: string;
  label?: string;
  value?: string | null;
  onChange?: (url: string) => void;
  folder?: "products" | "variants" | "brands" | "categories";
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

  useEffect(() => {
    let cancelled = false;

    async function loadUploadConfig() {
      try {
        const response = await fetch("/api/admin/upload");
        const payload = (await response.json()) as UploadConfig & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not check upload settings.");
        }

        if (!cancelled) {
          setUploadConfig(payload);
        }
      } catch {
        if (!cancelled) {
          setUploadConfig({
            mode: "unavailable",
            available: false,
            useClientUpload: false,
            maxBytes: 4 * 1024 * 1024,
            message:
              "Image upload is not available right now. Paste an image URL instead.",
          });
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

  async function uploadViaServer(file: File) {
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

  async function uploadViaBlob(file: File, contentType: string) {
    const extension = extensionForContentType(contentType);
    if (!extension) {
      throw new Error("Unsupported image type.");
    }

    const pathname = `${folder}/${crypto.randomUUID()}.${extension}`;
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload/client",
      contentType,
    });

    return blob.url;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError(null);

    if (!uploadConfig?.available) {
      setError(
        uploadConfig?.message ??
          "Image upload is not configured. Paste an image URL instead.",
      );
      return;
    }

    const contentType = resolveImageContentType(file);
    if (!contentType) {
      setError(getUnsupportedImageTypeMessage(file));
      return;
    }

    if (file.size > uploadConfig.maxBytes) {
      setError(`Image must be ${formatMaxSize(uploadConfig.maxBytes)} or smaller.`);
      return;
    }

    setIsUploading(true);

    try {
      const url = uploadConfig.useClientUpload
        ? await uploadViaBlob(file, contentType)
        : await uploadViaServer(file);

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

  const uploadDisabled = isUploading || uploadConfig?.available === false;

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
            <Image
              src={currentUrl}
              alt={label || "Uploaded image"}
              fill
              className="object-cover"
              sizes={compact ? "64px" : "320px"}
              unoptimized={currentUrl.startsWith("http")}
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
              ? `JPG, PNG, WebP, or GIF up to ${formatMaxSize(uploadConfig.maxBytes)}. You can also paste an image URL.`
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
