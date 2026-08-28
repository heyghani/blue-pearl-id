"use client";

import Image from "next/image";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt?: string | null;
}

function GalleryThumbnails({
  images,
  activeIndex,
  onSelect,
  viewImageLabel,
  className,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  viewImageLabel: string;
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
      {images.map((image, index) => (
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
          aria-label={`${viewImageLabel} ${index + 1}`}
          aria-current={index === activeIndex}
        >
          <Image
            src={image.url}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            loading="lazy"
          />
        </button>
      ))}
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

export function ImageGallery({
  images,
  productName,
  variant = "responsive",
  compact = false,
}: {
  images: GalleryImage[];
  productName: string;
  variant?: "mobile" | "desktop" | "responsive";
  compact?: boolean;
}) {
  const t = useTranslations();
  const isDesktop = useIsDesktop();
  const touchStartX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  const showMobile =
    variant === "mobile" || (variant === "responsive" && !isDesktop);
  const showDesktop =
    variant === "desktop" || (variant === "responsive" && isDesktop);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = Math.max(0, Math.min(index, images.length - 1));
      setActiveIndex(next);
    },
    [images.length],
  );

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

  return (
    <div className="min-w-0 w-full max-w-full space-y-3 sm:space-y-4">
      {showMobile ? (
        <div className={cn("min-w-0 w-full max-w-full", images.length > 1 && "pb-6")}>
          <div
            className={cn(
              "relative w-full max-w-full bg-muted",
              compact ? "aspect-square" : "aspect-[4/5]",
            )}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={active.url}
              src={active.url}
              alt={active.alt ?? `${productName} ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
          </div>

          <GalleryThumbnails
            images={images}
            activeIndex={activeIndex}
            onSelect={goTo}
            viewImageLabel={t.product.viewImage}
            className="px-4"
          />
        </div>
      ) : null}

      {showDesktop ? (
        <div className="min-w-0 w-full max-w-full">
          <div className="relative aspect-square w-full max-w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src={active.url}
              alt={active.alt ?? productName}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <GalleryThumbnails
            images={images}
            activeIndex={activeIndex}
            onSelect={goTo}
            viewImageLabel={t.product.viewImage}
          />
        </div>
      ) : null}
    </div>
  );
}
