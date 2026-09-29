"use client";

import Image from "next/image";
import { Play, ZoomIn } from "lucide-react";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { MediaLightbox, type ViewerMedia } from "@/components/product/media-lightbox";
import { inferProductMediaKind, videoPreviewSrc } from "@/lib/products/media";
import { cn } from "@/lib/utils";

export type GalleryMedia = ViewerMedia;

function mediaKind(item: GalleryMedia) {
  return item.type === "video" || item.type === "image"
    ? item.type
    : inferProductMediaKind(item.url);
}

function GalleryThumbnails({
  images,
  activeIndex,
  onSelect,
  viewImageLabel,
  viewVideoLabel,
  className,
}: {
  images: GalleryMedia[];
  activeIndex: number;
  onSelect: (index: number) => void;
  viewImageLabel: string;
  viewVideoLabel: string;
  className?: string;
}) {
  if (images.length <= 1) return null;

  return (
    <div
      className={cn(
        "mt-3 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {images.map((image, index) => {
        const kind = mediaKind(image);

        return (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
              index === activeIndex
                ? "border-foreground"
                : "border-transparent opacity-70 hover:opacity-100",
            )}
            aria-label={`${kind === "video" ? viewVideoLabel : viewImageLabel} ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
          >
            {kind === "video" ? (
              <video
                src={videoPreviewSrc(image.url)}
                muted
                playsInline
                preload="metadata"
                className="pointer-events-none h-full w-full object-cover"
              />
            ) : (
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
              />
            )}
            {kind === "video" ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                <Play className="h-4 w-4 fill-white text-white" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function subscribeLg(onStoreChange: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getLgSnapshot() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function getLgServerSnapshot() {
  return false;
}

function useIsDesktop() {
  return useSyncExternalStore(subscribeLg, getLgSnapshot, getLgServerSnapshot);
}

function MediaStage({
  item,
  productName,
  activeIndex,
  priority,
  sizes,
  compact,
  rounded,
  openLabel,
  onOpen,
  onTouchStart,
  onTouchEnd,
}: {
  item: GalleryMedia;
  productName: string;
  activeIndex: number;
  priority: boolean;
  sizes: string;
  compact: boolean;
  rounded: boolean;
  openLabel: string;
  onOpen: () => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
}) {
  const kind = mediaKind(item);

  return (
    <div
      className={cn(
        "relative w-full max-w-full bg-muted",
        compact ? "aspect-square" : "aspect-[4/5] lg:aspect-square",
        rounded && "overflow-hidden rounded-2xl",
      )}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "absolute inset-0",
          kind === "video" ? "cursor-pointer" : "cursor-zoom-in",
        )}
        aria-label={openLabel}
      >
        {kind === "video" ? (
          <>
            <video
              key={item.url}
              src={videoPreviewSrc(item.url)}
              muted
              playsInline
              preload="metadata"
              className="pointer-events-none h-full w-full object-contain"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm">
                <Play className="h-6 w-6 fill-current" />
              </span>
            </span>
          </>
        ) : (
          <Image
            key={item.url}
            src={item.url}
            alt={item.alt ?? `${productName} ${activeIndex + 1}`}
            fill
            className="object-contain"
            sizes={sizes}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        )}
        {kind === "image" ? (
          <span className="pointer-events-none absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm">
            <ZoomIn className="h-4 w-4" />
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function ImageGallery({
  images,
  productName,
  variant = "responsive",
  compact = false,
}: {
  images: GalleryMedia[];
  productName: string;
  variant?: "mobile" | "desktop" | "responsive";
  compact?: boolean;
}) {
  const t = useTranslations();
  const isDesktop = useIsDesktop();
  const touchStartX = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const active = images[activeIndex] ?? images[0];

  const showMobile = variant === "mobile" || (variant === "responsive" && !isDesktop);
  const showDesktop = variant === "desktop" || (variant === "responsive" && isDesktop);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = Math.max(0, Math.min(index, images.length - 1));
      setActiveIndex(next);
    },
    [images.length],
  );

  const openViewer = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setViewerOpen(true);
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (touchStartX.current == null || images.length <= 1) return;

      const endX = event.changedTouches[0]?.clientX;
      if (endX == null) return;

      const delta = endX - touchStartX.current;
      touchStartX.current = null;

      if (Math.abs(delta) < 40) return;
      suppressClickRef.current = true;
      if (delta < 0) {
        goTo(activeIndex + 1);
      } else {
        goTo(activeIndex - 1);
      }
    },
    [activeIndex, goTo, images.length],
  );

  if (!active) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-sm text-muted-foreground sm:rounded-2xl",
          compact ? "aspect-square" : "aspect-[4/5] sm:aspect-square",
        )}
      >
        {t.product.noImageAvailable}
      </div>
    );
  }

  const openLabel =
    mediaKind(active) === "video"
      ? `${t.product.viewVideo} ${activeIndex + 1}`
      : `${t.product.viewImage} ${activeIndex + 1}`;

  return (
    <div className="min-w-0 w-full max-w-full space-y-3 sm:space-y-4">
      {showMobile ? (
        <div className={cn("min-w-0 w-full max-w-full", images.length > 1 && "pb-6")}>
          <MediaStage
            item={active}
            productName={productName}
            activeIndex={activeIndex}
            priority={activeIndex === 0}
            sizes="100vw"
            compact={compact}
            rounded={false}
            openLabel={openLabel}
            onOpen={openViewer}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          <GalleryThumbnails
            images={images}
            activeIndex={activeIndex}
            onSelect={goTo}
            viewImageLabel={t.product.viewImage}
            viewVideoLabel={t.product.viewVideo}
            className="px-4"
          />
        </div>
      ) : null}

      {showDesktop ? (
        <div className="min-w-0 w-full max-w-full">
          <MediaStage
            item={active}
            productName={productName}
            activeIndex={activeIndex}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            compact
            rounded
            openLabel={openLabel}
            onOpen={openViewer}
          />

          <GalleryThumbnails
            images={images}
            activeIndex={activeIndex}
            onSelect={goTo}
            viewImageLabel={t.product.viewImage}
            viewVideoLabel={t.product.viewVideo}
          />
        </div>
      ) : null}

      <MediaLightbox
        open={viewerOpen}
        index={activeIndex}
        media={images}
        productName={productName}
        onClose={() => setViewerOpen(false)}
        onIndexChange={goTo}
      />
    </div>
  );
}
