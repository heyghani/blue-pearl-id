"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  label?: string;
  value?: string | null;
  onChange?: (url: string) => void;
  folder?: "products" | "variants";
  compact?: boolean;
  className?: string;
};

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

  function updateUrl(url: string) {
    setCurrentUrl(url);
    onChange?.(url);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
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

      updateUrl(payload.url);
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
              disabled={isUploading}
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
            JPG, PNG, WebP, or GIF up to 5 MB. You can also paste an image URL.
          </p>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
