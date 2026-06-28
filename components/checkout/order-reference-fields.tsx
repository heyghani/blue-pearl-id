"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchUploadConfig,
  uploadImageFile,
  type UploadConfig,
} from "@/lib/uploads/client-image-upload";
import {
  getUnsupportedImageTypeMessage,
  resolveImageContentType,
} from "@/lib/validations/upload";

type Props = {
  defaultPhotoUrl?: string;
  defaultDimensions?: string;
  fieldErrors?: {
    orderReferencePhotoUrl?: string[];
    orderDimensions?: string[];
  };
  onUploadingChange?: (uploading: boolean) => void;
};

function formatMaxSize(bytes: number) {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}

export function OrderReferenceFields({
  defaultPhotoUrl = "",
  defaultDimensions = "",
  fieldErrors,
  onUploadingChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(defaultPhotoUrl);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  useEffect(() => {
    let cancelled = false;

    async function loadUploadConfig() {
      try {
        const config = await fetchUploadConfig("checkout");
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
                : "Reference photo upload is not available right now.",
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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    setError(null);

    if (configLoading) {
      setError("Upload settings are still loading. Please try again in a moment.");
      return;
    }

    if (!uploadConfig?.available) {
      setError(uploadConfig?.message ?? "Reference photo upload is not available.");
      return;
    }

    if (!resolveImageContentType(file)) {
      setError(getUnsupportedImageTypeMessage(file));
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadImageFile(file, "orders", uploadConfig, "checkout");
      setPhotoUrl(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function clearPhoto() {
    setPhotoUrl("");
    setError(null);
  }

  const uploadDisabled = isUploading || configLoading || uploadConfig?.available === false;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Custom order details (optional)</h2>
        <p className="text-sm text-muted-foreground">
          Share a reference photo and dimensions if you need a custom style or size.
        </p>
      </div>

      <input type="hidden" name="orderReferencePhotoUrl" value={photoUrl} />

      <div className="space-y-2">
        <Label htmlFor="orderReferencePhoto">Reference photo</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Order reference"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImagePlus className="h-7 w-7" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
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
                ) : photoUrl ? (
                  "Replace photo"
                ) : (
                  "Upload photo"
                )}
              </Button>

              {photoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isUploading}
                  onClick={clearPhoto}
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              ) : null}
            </div>

            <p className="text-xs text-muted-foreground">
              {uploadConfig?.available
                ? `Optional. JPG, PNG, WebP, or GIF up to ${formatMaxSize(uploadConfig.maxBytes)}.`
                : "Photo upload is not configured on this server."}
            </p>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            {fieldErrors?.orderReferencePhotoUrl ? (
              <p className="text-xs text-destructive">
                {fieldErrors.orderReferencePhotoUrl[0]}
              </p>
            ) : null}
          </div>
        </div>

        <input
          ref={inputRef}
          id="orderReferencePhoto"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/*,.jpg,.jpeg,.png,.webp,.gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderDimensions">Dimensions</Label>
        <Input
          id="orderDimensions"
          name="orderDimensions"
          defaultValue={defaultDimensions}
          placeholder="e.g. Length 45 cm, width 30 cm, ring size 7"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Add any measurements or size details for your order.
        </p>
        {fieldErrors?.orderDimensions ? (
          <p className="text-xs text-destructive">{fieldErrors.orderDimensions[0]}</p>
        ) : null}
      </div>
    </section>
  );
}
