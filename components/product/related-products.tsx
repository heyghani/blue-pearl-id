import { ProductCard } from "@/components/catalog/product-card";
import type { ProductCardData } from "@/components/catalog/product-card";

export function RelatedProductsSection({
  products,
}: {
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-t pt-12">
      <h2 className="text-xl font-semibold tracking-tight">Related products</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
