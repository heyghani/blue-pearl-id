import type { ProductSort } from "@/lib/products";

export interface CatalogSearchParams {
  page?: string;
  q?: string;
  category?: string | string[];
  brand?: string | string[];
  sort?: string;
  featured?: string;
}

export function parseCatalogParams(
  searchParams: CatalogSearchParams,
): {
  page: number;
  search?: string;
  category?: string[];
  brand?: string[];
  sort: ProductSort;
  featured: boolean;
} {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const sort = isValidSort(searchParams.sort) ? searchParams.sort : "newest";
  const categoryRaw = searchParams.category;
  const brandRaw = searchParams.brand;
  const category = categoryRaw
    ? Array.isArray(categoryRaw)
      ? categoryRaw
      : categoryRaw.split(",").filter(Boolean)
    : undefined;
  const brand = brandRaw
    ? Array.isArray(brandRaw)
      ? brandRaw
      : brandRaw.split(",").filter(Boolean)
    : undefined;

  return {
    page,
    search: searchParams.q?.trim() || undefined,
    category,
    brand,
    sort,
    featured: searchParams.featured === "true",
  };
}

function isValidSort(value?: string): value is ProductSort {
  return (
    value === "newest" ||
    value === "price_asc" ||
    value === "price_desc" ||
    value === "popular"
  );
}

export const SORT_OPTIONS: { value: ProductSort; labelKey: ProductSortLabelKey }[] = [
  { value: "newest", labelKey: "sortNewest" },
  { value: "popular", labelKey: "sortFeatured" },
  { value: "price_asc", labelKey: "sortPriceAsc" },
  { value: "price_desc", labelKey: "sortPriceDesc" },
];

export type ProductSortLabelKey =
  | "sortNewest"
  | "sortFeatured"
  | "sortPriceAsc"
  | "sortPriceDesc";

export function resolveCatalogTitle({
  featured,
  categoryName,
  brandName,
  shopAllLabel,
  featuredLabel,
}: {
  featured: boolean;
  categoryName?: string | null;
  brandName?: string | null;
  shopAllLabel: string;
  featuredLabel: string;
}) {
  if (featured) return featuredLabel;
  if (categoryName && brandName) return `${categoryName} · ${brandName}`;
  if (categoryName) return categoryName;
  if (brandName) return brandName;
  return shopAllLabel;
}
