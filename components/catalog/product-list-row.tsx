"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/catalog/product-card";

export function ProductListRow({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  const t = useTranslations();

  return (
    <article className={cn("group", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-border hover:bg-muted/30 sm:gap-4 sm:p-4"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              {t.product.noImage}
            </div>
          )}
          {product.inStock === false ? (
            <span className="absolute inset-x-1 bottom-1 rounded bg-background/90 px-1.5 py-0.5 text-center text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.product.outOfStock}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
          <div className="min-w-0 space-y-1">
            {product.brandName ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--pearl)]">
                {product.brandName}
              </p>
            ) : null}
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-[var(--pearl)] sm:text-base">
              {product.name}
            </h3>
            {product.tags && product.tags.length > 0 ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {product.tags.join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-3">
            <Price amount={product.price} compareAt={product.compareAtPrice} className="text-base" />
            {product.inStock !== false ? (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {t.product.inStock}
              </span>
            ) : null}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 sm:hidden" />
          </div>
        </div>
      </Link>
    </article>
  );
}
