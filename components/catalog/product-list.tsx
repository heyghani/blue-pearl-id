"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ProductListRow } from "@/components/catalog/product-list-row";
import type { ProductCardData } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProductList({
  products,
  className,
}: {
  products: ProductCardData[];
  className?: string;
}) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const clearFiltersHref = (() => {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  })();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">{t.catalog.emptyResults}</p>
        <Button variant="outline" className="mt-4 rounded-full" asChild>
          <Link href={clearFiltersHref}>{t.catalog.clearFilters}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {products.map((product) => (
        <ProductListRow key={product.slug} product={product} />
      ))}
    </div>
  );
}
