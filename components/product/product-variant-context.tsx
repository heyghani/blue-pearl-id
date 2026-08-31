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
  buildOptionNamesByValueId,
  findPartialVariantPreview,
  findVariantBySelections,
  resolveVariantImageUrl,
  type SerializedProductOption,
  type SerializedProductVariant,
} from "@/lib/products/variants";

type GalleryImage = { url: string; alt?: string | null };

type ProductVariantContextValue = {
  selections: Record<string, string>;
  setSelection: (optionId: string, value: string) => void;
  clearSelections: () => void;
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

  const galleryImages = useMemo(() => {
    const optionNamesByValueId = buildOptionNamesByValueId(options);
    const resolvedImageUrl = resolveVariantImageUrl(
      activeVariant
        ? {
            imageUrl: activeVariant.imageUrl,
            optionValueIds: activeVariant.optionValueIds,
          }
        : null,
      variants,
      baseImages[0]?.url ?? null,
      optionNamesByValueId,
    );

    // Only promote a sibling/color image when a variant selection is active.
    const variantImageUrl = activeVariant ? resolvedImageUrl : null;
    return buildGalleryImages(baseImages, variantImageUrl);
  }, [activeVariant, baseImages, options, variants]);

  const value = useMemo(
    () => ({
      selections,
      setSelection: (optionId: string, value: string) => {
        setSelections((current) => ({ ...current, [optionId]: value }));
      },
      clearSelections: () => setSelections({}),
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
  variant = "responsive",
  compact = false,
}: {
  productName: string;
  variant?: "mobile" | "desktop" | "responsive";
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