"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Star, X } from "lucide-react";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { MAX_PRODUCT_IMAGES } from "@/lib/validations/admin";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  label?: string;
  value?: string[];
  productName?: string;
};

export function ProductImagesField({
  name = "imagesPayload",
  label = "Product images",
  value = [],
  productName,
}: Props) {
  const [images, setImages] = useState<string[]>(value.filter(Boolean));

  function addImage(url: string) {
    const trimmed = url.trim();
    if (!trimmed || images.length >= MAX_PRODUCT_IMAGES) return;
    if (images.includes(trimmed)) return;
    setImages((current) => [...current, trimmed]);
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          Add up to {MAX_PRODUCT_IMAGES} images. The first image is used as the primary
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
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
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
          No images yet. Upload the primary product photo below.
        </p>
      )}

      {images.length < MAX_PRODUCT_IMAGES ? (
        <div className={cn(images.length > 0 && "border-t pt-4")}>
          <ImageUploadField
            key={`product-image-upload-${images.length}`}
            label={images.length === 0 ? "Primary image" : "Add another image"}
            value=""
            folder="products"
            onChange={addImage}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Maximum of {MAX_PRODUCT_IMAGES} images reached.
        </p>
      )}
    </div>
  );
}
