import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/product/image-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { RelatedProductsSection } from "@/components/product/related-products";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import { ProductJsonLd } from "@/components/shared/product-json-ld";
import {
  getProductBySlug,
  getRelatedProducts,
  isInStock,
  parseProductSpecs,
  toProductCard,
} from "@/lib/products";

export const revalidate = 30;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const description =
    product.shortDescription ??
    product.description?.slice(0, 160) ??
    undefined;

  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.categoryId, product.slug);
  const inStock = isInStock(product.inventory);
  const specs = parseProductSpecs(product.metadata);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const productUrl = `${baseUrl}/products/${product.slug}`;

  return (
    <>
      <ProductJsonLd
        name={product.name}
        description={product.shortDescription ?? product.description}
        sku={product.sku}
        image={product.images.map((img) => img.url)}
        price={product.price.toString()}
        inStock={inStock}
        url={productUrl}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-foreground">
            Shop
          </Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-foreground"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ImageGallery images={product.images} productName={product.name} />

          <div className="space-y-6">
            <div className="space-y-3">
              {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
              <h1 className="text-3xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <Price
                amount={product.price.toString()}
                compareAt={product.compareAtPrice?.toString()}
              />
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              {product.shortDescription && (
                <p className="text-muted-foreground">{product.shortDescription}</p>
              )}
            </div>

            <ProductActions productId={product.id} inStock={inStock} />

            <Separator />

            <DutiesNotice />
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold">Description</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {product.description ? (
                product.description.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              ) : (
                <p>No description available.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Specifications</h2>
            {specs ? (
              <dl className="mt-4 divide-y rounded-lg border">
                {Object.entries(specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"
                  >
                    <dt className="font-medium text-foreground">{key}</dt>
                    <dd className="text-muted-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No additional specifications listed.
              </p>
            )}
          </section>
        </div>

        <div className="mt-16">
          <RelatedProductsSection products={related.map(toProductCard)} />
        </div>
      </div>
    </>
  );
}
