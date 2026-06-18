import type { ProductSort } from "@/lib/products";

export interface CatalogSearchParams {
  page?: string;
  q?: string;
  category?: string | string[];
  sort?: string;
  featured?: string;
}

export function parseCatalogParams(
  searchParams: CatalogSearchParams,
): {
  page: number;
  search?: string;
  category?: string[];
  sort: ProductSort;
  featured: boolean;
} {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const sort = isValidSort(searchParams.sort) ? searchParams.sort : "newest";
  const categoryRaw = searchParams.category;
  const category = categoryRaw
    ? Array.isArray(categoryRaw)
      ? categoryRaw
      : categoryRaw.split(",").filter(Boolean)
    : undefined;

  return {
    page,
    search: searchParams.q?.trim() || undefined,
    category,
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

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];
