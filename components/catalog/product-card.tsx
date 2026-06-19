import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
}: {
  product: ProductCardData;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg",
        className,
      )}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium leading-snug transition-colors group-hover:text-[var(--pearl)]">
            {product.name}
          </h3>
          <Price amount={product.price} compareAt={product.compareAtPrice} className="mt-2" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <span
            className={cn(
              "text-xs",
              product.inStock === false
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {product.inStock === false ? "Out of stock" : "In stock"}
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
