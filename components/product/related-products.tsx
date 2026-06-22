"use client";

import { ProductCard, type ProductCardData } from "@/components/catalog/product-card";
import { useTranslations } from "@/components/i18n/locale-provider";

export function RelatedProductsSection({
  products,
}: {
  products: ProductCardData[];
}) {
  const t = useTranslations();

  if (products.length === 0) return null;

  return (
    <section className="mt-10 border-t pt-8 sm:mt-12 sm:pt-10">
      <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
        {t.product.related}
      </h2>

      <div className="-mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[38vw] shrink-0 sm:w-auto sm:shrink"
          >
            <ProductCard product={product} compact showPriceOnImage />
          </div>
        ))}
      </div>
    </section>
  );
}
