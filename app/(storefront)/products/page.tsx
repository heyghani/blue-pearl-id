import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CategoryPills } from "@/components/catalog/category-pills";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { parseCatalogParams } from "@/lib/catalog";
import { getActiveCategories } from "@/lib/categories";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { getCatalogProducts, toProductCard } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our collection of premium pearls and fine jewelry. Worldwide shipping in USD.",
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
    sort: rawParams.sort as string | undefined,
    featured: rawParams.featured as string | undefined,
  });

  const [catalog, categories] = await Promise.all([
    getCatalogProducts({
      page: params.page,
      search: params.search,
      category: params.category,
      sort: params.sort,
      featured: params.featured,
    }),
    getActiveCategories(),
  ]);

  const products = catalog.products.map(toProductCard);
  const title = params.featured ? t.catalog.featured : t.catalog.shopAll;
  const countLabel =
    catalog.total === 1 ? t.catalog.product : t.catalog.products;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {catalog.total} {countLabel}
          {params.search ? ` ${t.catalog.searchFor} “${params.search}”` : ""}
        </p>
      </div>

      <CatalogToolbar className="mb-4" />

      <Suspense fallback={<div className="mb-5 h-10 animate-pulse rounded-full bg-muted" />}>
        <CategoryPills categories={categories} className="mb-5 sm:mb-6" />
      </Suspense>

      <ProductGrid products={products} />

      <Suspense fallback={null}>
        <CatalogPagination
          page={catalog.page}
          totalPages={catalog.totalPages}
          searchParams={rawParams}
          className="mt-8"
        />
      </Suspense>

      <DutiesNotice className="mt-8 text-center sm:text-left" />
    </div>
  );
}
