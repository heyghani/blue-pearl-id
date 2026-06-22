"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ImageGallery } from "@/components/product/image-gallery";
import {
  findPartialVariantPreview,
  findVariantBySelections,
  type SerializedProductOption,
  type SerializedProductVariant,
} from "@/lib/products/variants";

type GalleryImage = { url: string; alt?: string | null };

type ProductVariantContextValue = {
  selections: Record<string, string>;
  setSelection: (optionId: string, value: string) => void;
  selectedVariant: SerializedProductVariant | null;
  previewVariant: SerializedProductVariant | null;
  galleryImages: GalleryImage[];
  activeImageUrl: string | null;
};

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);

function buildGalleryImages(
  baseImages: GalleryImage[],
  variantImageUrl: string | null | undefined,
): GalleryImage[] {
  if (!variantImageUrl) return baseImages;

  const primaryAlt = baseImages[0]?.alt;
  const rest = baseImages.filter((image) => image.url !== variantImageUrl);

  return [{ url: variantImageUrl, alt: primaryAlt }, ...rest];
}

export function ProductVariantProvider({
  baseImages,
  options,
  variants,
  hasVariants,
  children,
}: {
  baseImages: GalleryImage[];
  options: SerializedProductOption[];
  variants: SerializedProductVariant[];
  hasVariants: boolean;
  children: ReactNode;
}) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return findVariantBySelections(variants, options, selections);
  }, [hasVariants, options, selections, variants]);

  const previewVariant = useMemo(() => {
    if (!hasVariants || selectedVariant) return null;
    return findPartialVariantPreview(variants, options, selections);
  }, [hasVariants, options, selections, selectedVariant, variants]);

  const activeVariant = selectedVariant ?? previewVariant;

  const galleryImages = useMemo(
    () => buildGalleryImages(baseImages, activeVariant?.imageUrl),
    [activeVariant?.imageUrl, baseImages],
  );

  const value = useMemo(
    () => ({
      selections,
      setSelection: (optionId: string, value: string) => {
        setSelections((current) => ({ ...current, [optionId]: value }));
      },
      selectedVariant,
      previewVariant,
      galleryImages,
      activeImageUrl: galleryImages[0]?.url ?? null,
    }),
    [galleryImages, previewVariant, selectedVariant, selections],
  );

  return (
    <ProductVariantContext.Provider value={value}>{children}</ProductVariantContext.Provider>
  );
}

export function useProductVariant() {
  const context = useContext(ProductVariantContext);
  if (!context) {
    throw new Error("useProductVariant must be used within ProductVariantProvider");
  }
  return context;
}

export function ProductGallery({
  productName,
  variant,
  compact = false,
}: {
  productName: string;
  variant: "mobile" | "desktop";
  compact?: boolean;
}) {
  const { galleryImages } = useProductVariant();
  const galleryKey = galleryImages.map((image) => image.url).join("|") || productName;

  return (
    <ImageGallery
      key={galleryKey}
      images={galleryImages}
      productName={productName}
      variant={variant}
      compact={compact}
    />
  );
}