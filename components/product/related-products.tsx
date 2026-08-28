import { ProductCard, type ProductCardData } from "@/components/catalog/product-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function RelatedProductsSection({
  products,
}: {
  products: ProductCardData[];
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);

  if (products.length === 0) return null;

  return (
    <section className="mt-10 min-w-0 overflow-x-clip border-t pt-8 sm:mt-12 sm:pt-10">
      <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">
        {t.product.related}
      </h2>

      <div className="mt-4 min-w-0 max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-0 gap-2.5 px-4 pb-2 sm:contents sm:px-0">
        {products.map((product) => (
          <div
            key={product.slug}
            className="w-[72vw] max-w-[16rem] shrink-0 sm:w-auto sm:max-w-none sm:shrink"
          >
            <ProductCard product={product} compact showPriceOnImage />
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
