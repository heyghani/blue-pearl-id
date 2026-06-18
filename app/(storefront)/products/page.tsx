import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { parseCatalogParams } from "@/lib/catalog";
import { getActiveCategories } from "@/lib/categories";
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
  const title = params.featured ? "Featured" : "Shop All";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          {catalog.total} {catalog.total === 1 ? "product" : "products"}
          {params.search ? ` for “${params.search}”` : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<div className="h-10 w-full max-w-sm rounded-md bg-muted" />}>
          <CatalogSearch className="w-full max-w-sm" />
        </Suspense>
        <Suspense fallback={<div className="h-10 w-40 rounded-md bg-muted" />}>
          <CatalogSort className="w-full sm:w-auto" />
        </Suspense>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={null}>
            <CategoryFilter categories={categories} />
          </Suspense>
        </aside>

        <div className="space-y-10">
          <div className="lg:hidden">
            <Suspense fallback={null}>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>

          <ProductGrid products={products} />

          <CatalogPagination
            page={catalog.page}
            totalPages={catalog.totalPages}
            searchParams={rawParams}
          />

          <DutiesNotice />
        </div>
      </div>
    </div>
  );
}
