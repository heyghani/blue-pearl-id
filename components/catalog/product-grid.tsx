"use client";

import Link from "next/link";

import { ProductCard, type ProductCardData } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
}: {
  products: ProductCardData[];
  className?: string;
}) {
  const t = useTranslations();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">{t.catalog.emptyResults}</p>
        <Button variant="outline" className="mt-4 rounded-full" asChild>
          <Link href="/products">{t.catalog.clearFilters}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} showPriceOnImage />
      ))}
    </div>
  );
}
