"use client";

import Link from "next/link";
import Image from "next/image";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  slug: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  imageUrl?: string | null;
  inStock?: boolean;
}

export function ProductCard({
  product,
  className,
  compact,
  showPriceOnImage,
}: {
  product: ProductCardData;
  className?: string;
  compact?: boolean;
  showPriceOnImage?: boolean;
}) {
  const t = useTranslations();
  const priceOnImage = showPriceOnImage ?? !compact;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl bg-card transition-transform active:scale-[0.98]",
        className,
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl bg-muted",
            compact ? "aspect-[3/4]" : "aspect-[4/5]",
          )}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes={compact ? "160px" : "(max-width: 768px) 50vw, 25vw"}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {t.product.noImage}
            </div>
          )}

          {priceOnImage ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2.5 pb-2.5 pt-8">
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                className="[&_span:first-child]:text-base [&_span:first-child]:font-bold [&_span:first-child]:text-white [&_span:last-child]:text-white/70"
              />
            </div>
          ) : null}

          {product.inStock === false ? (
            <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-destructive backdrop-blur">
              {t.product.outOfStock}
            </span>
          ) : null}
        </div>

        <div className={cn("pt-2", compact && "pt-1.5")}>
          <h3
            className={cn(
              "line-clamp-2 font-medium leading-snug text-foreground",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {product.name}
          </h3>
          {!priceOnImage ? (
            <Price
              amount={product.price}
              compareAt={product.compareAtPrice}
              className={cn("mt-1", compact && "text-sm")}
            />
          ) : null}
        </div>
      </Link>
    </article>
  );
}
