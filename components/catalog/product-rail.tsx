"use client";

import Link from "next/link";

import { ProductCard, type ProductCardData } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductRail({
  id,
  title,
  description,
  products,
  viewAllLabel,
  viewAllHref = "/products",
  ctaLabel,
  ctaHref,
  className,
}: {
  id?: string;
  title: string;
  description: string;
  products: ProductCardData[];
  viewAllLabel: string;
  viewAllHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section id={id} className={cn("py-10 sm:py-14 scroll-mt-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>

        <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <div
              key={product.slug}
              className="w-[44vw] shrink-0 sm:w-auto sm:shrink"
            >
              <ProductCard product={product} compact showPriceOnImage />
            </div>
          ))}
        </div>

        {ctaLabel && ctaHref ? (
          <div className="mt-6 flex justify-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-5 sm:hidden">
          <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
