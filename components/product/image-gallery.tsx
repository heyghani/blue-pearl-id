"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt?: string | null;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = Math.max(0, Math.min(index, images.length - 1));
      setActiveIndex(next);
      const container = scrollRef.current;
      if (container) {
        container.scrollTo({
          left: next * container.clientWidth,
          behavior: "smooth",
        });
      }
    },
    [images.length],
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
    <div className="space-y-3 sm:space-y-4">
      {(variant === "mobile" || variant === "responsive") && (
      <div className={cn("relative", variant === "responsive" && "sm:hidden")}>
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            if (index !== activeIndex && index >= 0 && index < images.length) {
              setActiveIndex(index);
            }
          }}
        >
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className={cn(
                "relative w-full shrink-0 snap-center bg-muted",
                compact ? "aspect-square" : "aspect-[4/5]",
              )}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/50",
                )}
                aria-label={`${t.product.viewImage} ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
      )}

      {(variant === "desktop" || variant === "responsive") && (
      <div className={cn(variant === "responsive" && "hidden sm:block")}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <Image
            src={active.url}
            alt={active.alt ?? productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        {images.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                  index === activeIndex
                    ? "border-foreground"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
                aria-label={`${t.product.viewImage} ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      )}
    </div>
  );
}
