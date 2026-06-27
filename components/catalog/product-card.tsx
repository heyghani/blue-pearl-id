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
  brandName?: string | null;
  tags?: string[];
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
        "group",
        className,
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-muted surface-elevated ring-1 ring-black/5",
            compact ? "aspect-[3/4]" : "aspect-[4/5]",
          )}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes={compact ? "160px" : "(max-width: 768px) 50vw, 25vw"}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {t.product.noImage}
            </div>
          )}

          {priceOnImage ? (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-12">
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                className="[&_span:first-child]:text-base [&_span:first-child]:font-semibold [&_span:first-child]:text-white [&_span:last-child]:text-white/65"
              />
            </div>
          ) : null}

          {product.inStock === false ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
              {t.product.outOfStock}
            </span>
          ) : null}
        </div>

        <div className={cn("pt-2.5", compact && "pt-2")}>
          {product.brandName ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {product.brandName}
            </p>
          ) : null}
          <h3
            className={cn(
              "line-clamp-2 font-medium leading-snug text-foreground transition-colors group-hover:text-[var(--pearl)]",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {product.name}
          </h3>
          {product.tags && product.tags.length > 0 ? (
            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              {product.tags.join(" · ")}
            </p>
          ) : null}
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
