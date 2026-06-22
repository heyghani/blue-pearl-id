import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ProductBackNav, ProductWhatsAppLink } from "@/components/product/product-actions";
import { ProductPurchaseSection } from "@/components/product/product-purchase-section";
import {
  ProductGallery,
  ProductVariantProvider,
} from "@/components/product/product-variant-context";
import { ProductDetailTabs } from "@/components/product/product-detail-tabs";
import { RelatedProductsSection } from "@/components/product/related-products";
import { ProductJsonLd } from "@/components/shared/product-json-ld";
import {
  getProductBySlug,
  getRelatedProducts,
  isInStock,
  parseProductSpecs,
  toProductCard,
} from "@/lib/products";
import { serializeProductVariants } from "@/lib/products/variants";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

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
  const [product, locale] = await Promise.all([getProductBySlug(slug), getLocale()]);
  const t = getDictionary(locale);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.categoryId, product.slug);
  const inStock = isInStock(product);
  const specs = parseProductSpecs(product.metadata);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const { options, variants } = serializeProductVariants(product.options, product.variants);
  const galleryImages = product.images.map((img) => ({
    url: img.url,
    alt: img.alt,
  }));

  const purchaseProps = {
    productId: product.id,
    productName: product.name,
    basePrice: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
    hasVariants: product.hasVariants,
    inStock,
    options,
  };

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

      <ProductVariantProvider
        baseImages={galleryImages}
        options={options}
        variants={variants}
        hasVariants={product.hasVariants}
      >
        <div className="pb-28 lg:pb-12">
          <div className="-mx-4 lg:hidden">
            <ProductGallery
              productName={product.name}
              variant="mobile"
              compact={product.hasVariants}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 -mt-5 rounded-t-3xl bg-background px-1 pt-5 sm:mt-0 sm:rounded-none sm:px-0 sm:pt-10">
              <ProductBackNav />

              <nav className="mb-4 hidden text-sm text-muted-foreground lg:block">
                <Link href="/products" className="hover:text-foreground">
                  {t.nav.shop}
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
                <div className="hidden lg:block">
                  <ProductGallery productName={product.name} variant="desktop" />
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {product.isFeatured ? (
                        <Badge className="rounded-full px-2.5">{t.catalog.featured}</Badge>
                      ) : null}
                      {!inStock ? (
                        <Badge variant="destructive" className="rounded-full px-2.5">
                          {t.product.outOfStock}
                        </Badge>
                      ) : (
                        <span className="text-xs font-medium text-[var(--pearl)]">
                          {t.product.inStock}
                        </span>
                      )}
                    </div>

                    <h1 className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl lg:text-3xl">
                      {product.name}
                    </h1>

                    {product.shortDescription ? (
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {product.shortDescription}
                      </p>
                    ) : null}
                  </div>

                  <div className="lg:hidden">
                    <ProductPurchaseSection {...purchaseProps} layout="mobile-split" />
                  </div>

                  <div className="hidden lg:block">
                    <ProductPurchaseSection {...purchaseProps} />
                  </div>

                  <ProductWhatsAppLink productName={product.name} />
                </div>
              </div>

              <ProductDetailTabs
                description={product.description}
                specs={specs}
              />

              <RelatedProductsSection products={related.map(toProductCard)} />
            </div>
          </div>
        </div>
      </ProductVariantProvider>
    </>
  );
}
