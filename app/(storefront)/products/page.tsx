import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ProductList } from "@/components/catalog/product-list";
import { parseCatalogParams, resolveCatalogTitle } from "@/lib/catalog";
import {
  getActiveBrands,
  getActiveCategoryTree,
  getBrandBySlug,
  getCategoryBySlug,
} from "@/lib/categories";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { getCatalogProducts, toProductCard } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse luxury OEM handbags, footwear, and accessories.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const rawParams = await searchParams;
  const params = parseCatalogParams({
    page: rawParams.page as string | undefined,
    q: rawParams.q as string | undefined,
    category: rawParams.category,
    brand: rawParams.brand,
    sort: rawParams.sort as string | undefined,
    featured: rawParams.featured as string | undefined,
  });

  const categorySlug = params.category?.[0];
  const brandSlug = params.brand?.[0];

  const [catalog, categoryTree, brands, activeCategory, activeBrand] =
    await Promise.all([
      getCatalogProducts({
        page: params.page,
        search: params.search,
        category: params.category,
        brand: params.brand,
        sort: params.sort,
        featured: params.featured,
      }),
      getActiveCategoryTree(),
      getActiveBrands(),
      categorySlug ? getCategoryBySlug(categorySlug) : null,
      brandSlug ? getBrandBySlug(brandSlug) : null,
    ]);

  const products = catalog.products.map(toProductCard);
  const title = resolveCatalogTitle({
    featured: params.featured,
    categoryName: activeCategory?.name,
    brandName: activeBrand?.name,
    shopAllLabel: t.catalog.shopAll,
    featuredLabel: t.catalog.featured,
  });
  const resultLabel =
    catalog.total === 1 ? t.catalog.product : t.catalog.products;

  return (
    <div className="mx-auto max-w-7xl px-2 pb-12 pt-3 sm:px-6 sm:py-8 lg:px-8">
      <CatalogShell
        categories={categoryTree}
        brands={brands}
        title={title}
        resultCount={catalog.total}
        resultLabel={resultLabel}
        activeCategoryName={activeCategory?.name}
        activeBrandName={activeBrand?.name}
      >
        <ProductList products={products} />

        <Suspense fallback={null}>
          <CatalogPagination
            page={catalog.page}
            totalPages={catalog.totalPages}
            searchParams={rawParams}
            className="mt-8"
          />
        </Suspense>
      </CatalogShell>
    </div>
  );
}
