import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductList } from "@/components/catalog/product-list";
import { HalloweenCatalogFrame } from "@/components/halloween/halloween-catalog-frame";
import { parseCatalogParams } from "@/lib/catalog";
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
  title: "Halloween",
  description: "Shop the Halloween collection — seasonal drops, separate from the main vault.",
};

export const revalidate = 60;

export default async function HalloweenCatalogPage({
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
    minPrice: rawParams.minPrice as string | undefined,
    maxPrice: rawParams.maxPrice as string | undefined,
    view: rawParams.view as string | undefined,
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
        halloween: true,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      }),
      getActiveCategoryTree({ halloween: true }),
      getActiveBrands({ halloween: true }),
      categorySlug ? getCategoryBySlug(categorySlug) : null,
      brandSlug ? getBrandBySlug(brandSlug) : null,
    ]);

  const products = catalog.products.map(toProductCard);
  const title = activeCategory?.name
    ? `${t.halloween.catalogTitle} · ${activeCategory.name}`
    : activeBrand?.name
      ? `${t.halloween.catalogTitle} · ${activeBrand.name}`
      : t.halloween.catalogTitle;
  const resultLabel =
    catalog.total === 1 ? t.catalog.product : t.catalog.products;

  const clearFilterParams = new URLSearchParams();
  if (params.sort && params.sort !== "newest") {
    clearFilterParams.set("sort", params.sort);
  }
  if (params.view === "list") {
    clearFilterParams.set("view", "list");
  }
  const clearFiltersHref = clearFilterParams.toString()
    ? `/halloween?${clearFilterParams.toString()}`
    : "/halloween";

  const ProductListing =
    params.view === "list" ? ProductList : ProductGrid;

  return (
    <HalloweenCatalogFrame
      eyebrow={t.halloween.catalogEyebrow}
      lead={t.halloween.catalogLead}
    >
      <CatalogShell
        basePath="/halloween"
        categories={categoryTree}
        brands={brands}
        title={title}
        resultCount={catalog.total}
        resultLabel={resultLabel}
        activeCategoryName={activeCategory?.name}
        activeBrandName={activeBrand?.name}
      >
        <ProductListing products={products} clearFiltersHref={clearFiltersHref} />

        <Suspense fallback={null}>
          <CatalogPagination
            page={catalog.page}
            totalPages={catalog.totalPages}
            searchParams={rawParams}
            className="mt-8"
          />
        </Suspense>
      </CatalogShell>
    </HalloweenCatalogFrame>
  );
}
