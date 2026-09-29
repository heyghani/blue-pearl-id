"use client";

import { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { useTranslations } from "@/components/i18n/locale-provider";
import {
  inferProductMediaKind,
  videoContentTypeFromUrl,
  type ProductMediaKind,
} from "@/lib/products/media";

const plugins = [Zoom, Video];

export type ViewerMedia = {
  url: string;
  alt?: string | null;
  type?: ProductMediaKind;
};

function mediaKind(item: ViewerMedia): ProductMediaKind {
  return item.type === "video" || item.type === "image"
    ? item.type
    : inferProductMediaKind(item.url);
}

function posterFor(media: ViewerMedia[], index: number) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (mediaKind(media[cursor]) === "image") return media[cursor]?.url;
  }

  return media.find((item) => mediaKind(item) === "image")?.url;
}

export function MediaLightbox({
  open,
  index,
  media,
  productName,
  onClose,
  onIndexChange,
}: {
  open: boolean;
  index: number;
  media: ViewerMedia[];
  productName: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const t = useTranslations();
  const slides = useMemo(
    () =>
      media.map((item, itemIndex) => {
        const alt = item.alt ?? `${productName} ${itemIndex + 1}`;

        if (mediaKind(item) === "video") {
          return {
            type: "video" as const,
            poster: posterFor(media, itemIndex),
            sources: [
              {
                src: item.url,
                type: videoContentTypeFromUrl(item.url),
              },
            ],
            autoPlay: true,
            controls: true,
            playsInline: true,
            preload: "metadata",
          };
        }

        return { src: item.url, alt };
      }),
    [media, productName],
  );

  if (slides.length === 0) return null;

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={plugins}
      carousel={{
        finite: slides.length < 2,
        imageFit: "contain",
        padding: "4%",
      }}
      zoom={{
        scrollToZoom: true,
        maxZoomPixelRatio: 4,
        zoomInMultiplier: 2,
        pinchZoomV4: true,
      }}
      video={{
        autoPlay: true,
        controls: true,
        playsInline: true,
        preload: "metadata",
      }}
      controller={{ closeOnBackdropClick: true }}
      on={{
        view: ({ index: nextIndex }) => onIndexChange(nextIndex),
      }}
      labels={{
        Previous: t.product.previousMedia,
        Next: t.product.nextMedia,
        Close: t.product.closeViewer,
        Lightbox: t.product.viewImage,
        "Photo gallery": productName,
        "{index} of {total}": t.product.mediaPosition,
        "Zoom in": t.product.zoomIn,
        "Zoom out": t.product.zoomOut,
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.92)" },
      }}
    />
  );
}
