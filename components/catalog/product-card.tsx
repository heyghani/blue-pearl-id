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
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium leading-snug">{product.name}</h3>
          <Price amount={product.price} compareAt={product.compareAtPrice} className="mt-2" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <span className="text-xs text-muted-foreground">
            {product.inStock === false ? "Out of stock" : "In stock"}
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
