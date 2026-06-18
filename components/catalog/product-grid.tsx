import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import type { ProductCardData } from "@/components/catalog/product-card";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
}: {
  products: ProductCardData[];
  className?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No products match your filters.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/products">Clear filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
