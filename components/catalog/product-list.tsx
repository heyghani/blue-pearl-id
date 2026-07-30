import Link from "next/link";

import { ProductListRow } from "@/components/catalog/product-list-row";
import type { ProductCardData } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function ProductList({
  products,
  className,
  clearFiltersHref = "/products",
}: {
  products: ProductCardData[];
  className?: string;
  clearFiltersHref?: string;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);

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
