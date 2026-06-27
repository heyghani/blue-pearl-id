"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

type SubCategory = {
  slug: string;
  name: string;
  _count: { products: number };
};

type RootCategory = {
  slug: string;
  name: string;
  _count: { products: number };
  children: SubCategory[];
};

type Brand = {
  slug: string;
  name: string;
  _count: { products: number };
};

type CategoryGroups = {
  jewelry: RootCategory[];
  footwear: RootCategory[];
  other: RootCategory[];
};

const JEWELRY_SLUGS = new Set([
  "necklaces",
  "earrings",
  "bracelets",
  "rings",
  "sets",
  "accessories",
]);

const FOOTWEAR_SLUGS = new Set(["footwear", "casual-shoes", "sandals", "canvas-shoes"]);

function isNavCategoryVisible(category: RootCategory) {
  if (category._count.products > 0) return true;
  if (category.children.length > 0) return true;
  return category.children.some((child) => child._count.products > 0);
}

function groupCategories(categories: RootCategory[]): CategoryGroups {
  const visible = categories.filter(isNavCategoryVisible);

  return {
    jewelry: visible.filter((category) => JEWELRY_SLUGS.has(category.slug)),
    footwear: visible.filter((category) => FOOTWEAR_SLUGS.has(category.slug)),
    other: visible.filter(
      (category) =>
        !JEWELRY_SLUGS.has(category.slug) && !FOOTWEAR_SLUGS.has(category.slug),
    ),
  };
}

function useCatalogFilters() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const activeSearch = searchParams.get("q") ?? "";
  const isFeatured = searchParams.get("featured") === "true";

  function buildHref(updates: {
    category?: string | null;
    brand?: string | null;
    q?: string | null;
    featured?: boolean | null;
  }) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");

    if (updates.category === null) next.delete("category");
    else if (updates.category) next.set("category", updates.category);

    if (updates.brand === null) next.delete("brand");
    else if (updates.brand) next.set("brand", updates.brand);

    if (updates.q === null) next.delete("q");
    else if (updates.q) next.set("q", updates.q);

    if (updates.featured === null) next.delete("featured");
    else if (updates.featured) next.set("featured", "true");

    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  function clearFiltersHref() {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return { activeCategory, activeBrand, activeSearch, isFeatured, buildHref, clearFiltersHref };
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
    >
      {label}
      <X className="h-3 w-3 text-muted-foreground" aria-hidden />
      <span className="sr-only">Remove filter</span>
    </Link>
  );
}

function SidebarLink({
  href,
  label,
  isActive,
  isHighlighted,
  count,
  indented,
}: {
  href: string;
  label: string;
  isActive: boolean;
  isHighlighted?: boolean;
  count?: number;
  indented?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-xs leading-snug transition-colors sm:px-3 sm:py-2 sm:text-sm",
        indented && "ml-1.5 border-l border-border/60 pl-2 sm:ml-2 sm:pl-3",
        isActive
          ? "bg-muted font-medium text-foreground"
          : isHighlighted
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <span className="line-clamp-2">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:inline">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarSection({
  title,
  categories,
  activeCategory,
  buildHref,
}: {
  title: string;
  categories: RootCategory[];
  activeCategory: string;
  buildHref: ReturnType<typeof useCatalogFilters>["buildHref"];
}) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-0.5">
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-3 sm:text-[11px]">
        {title}
      </p>
      {categories.map((category) => {
        const childActive = category.children.some((child) => child.slug === activeCategory);

        return (
          <div key={category.slug} className="space-y-0.5">
            <SidebarLink
              href={buildHref({ category: category.slug })}
              label={category.name}
              isActive={activeCategory === category.slug}
              isHighlighted={childActive && activeCategory !== category.slug}
              count={category._count.products}
            />
            {category.children.map((child) => (
              <SidebarLink
                key={child.slug}
                href={buildHref({ category: child.slug })}
                label={child.name}
                isActive={activeCategory === child.slug}
                count={child._count.products}
                indented
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CatalogSidebarNav({
  groups,
  brands,
  activeCategory,
  activeBrand,
  buildHref,
  allProductsLabel,
  allBrandsLabel,
  brandsLabel,
  jewelryLabel,
  footwearLabel,
  moreLabel,
  className,
}: {
  groups: CategoryGroups;
  brands: Brand[];
  activeCategory: string;
  activeBrand: string;
  buildHref: ReturnType<typeof useCatalogFilters>["buildHref"];
  allProductsLabel: string;
  allBrandsLabel: string;
  brandsLabel: string;
  jewelryLabel: string;
  footwearLabel: string;
  moreLabel: string;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-3 sm:space-y-4", className)} aria-label="Catalog filters">
      <SidebarLink
        href={buildHref({ category: null })}
        label={allProductsLabel}
        isActive={!activeCategory}
      />

      <SidebarSection
        title={jewelryLabel}
        categories={groups.jewelry}
        activeCategory={activeCategory}
        buildHref={buildHref}
      />
      <SidebarSection
        title={footwearLabel}
        categories={groups.footwear}
        activeCategory={activeCategory}
        buildHref={buildHref}
      />
      {groups.other.length > 0 ? (
        <SidebarSection
          title={moreLabel}
          categories={groups.other}
          activeCategory={activeCategory}
          buildHref={buildHref}
        />
      ) : null}

      {brands.length > 0 ? (
        <div className="space-y-0.5 border-t border-border/60 pt-2 sm:pt-3">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:px-3 sm:text-[11px]">
            {brandsLabel}
          </p>
          <SidebarLink
            href={buildHref({ brand: null })}
            label={allBrandsLabel}
            isActive={!activeBrand}
          />
          {brands.map((brand) => (
            <SidebarLink
              key={brand.slug}
              href={buildHref({ brand: brand.slug })}
              label={brand.name}
              isActive={activeBrand === brand.slug}
              count={brand._count.products}
            />
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function CatalogShellInner({
  categories,
  brands,
  title,
  resultCount,
  resultLabel,
  activeCategoryName,
  activeBrandName,
  children,
}: {
  categories: RootCategory[];
  brands: Brand[];
  title: string;
  resultCount: number;
  resultLabel: string;
  activeCategoryName?: string | null;
  activeBrandName?: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const { activeCategory, activeBrand, activeSearch, isFeatured, buildHref, clearFiltersHref } =
    useCatalogFilters();

  const groups = groupCategories(categories);

  const hasActiveFilters = Boolean(
    activeCategory || activeBrand || activeSearch || isFeatured,
  );

  const sidebarLabels = {
    allProductsLabel: t.catalog.allProducts,
    allBrandsLabel: t.catalog.allBrands,
    brandsLabel: t.catalog.brands,
    jewelryLabel: t.catalog.jewelry,
    footwearLabel: t.catalog.footwear,
    moreLabel: t.catalog.moreCategories,
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-1 px-0 lg:px-0">
        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {resultCount} {resultLabel}
          {activeSearch ? ` ${t.catalog.searchFor} “${activeSearch}”` : ""}
        </p>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          {isFeatured ? (
            <FilterChip label={t.catalog.featured} href={buildHref({ featured: null })} />
          ) : null}
          {activeCategoryName ? (
            <FilterChip
              label={activeCategoryName}
              href={buildHref({ category: null })}
            />
          ) : null}
          {activeBrandName ? (
            <FilterChip label={activeBrandName} href={buildHref({ brand: null })} />
          ) : null}
          {activeSearch ? (
            <FilterChip label={`“${activeSearch}”`} href={buildHref({ q: null })} />
          ) : null}
          <Link
            href={clearFiltersHref()}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t.catalog.clearFilters}
          </Link>
        </div>
      ) : null}

      <div className="flex items-start gap-2 sm:gap-3 lg:gap-8">
        <aside
          className={cn(
            "sticky top-14 z-20 shrink-0 self-start",
            "w-[5.75rem] sm:w-36 lg:w-52 xl:w-56",
            "max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain",
            "rounded-xl border border-border/60 bg-card/80 pb-3 pt-2 backdrop-blur-sm",
            "scrollbar-none lg:top-24 lg:max-h-[calc(100dvh-6rem)] lg:rounded-2xl lg:bg-card/50 lg:p-3 lg:pt-3",
          )}
        >
          <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:block">
            {t.catalog.categories}
          </p>

          <CatalogSidebarNav
            groups={groups}
            brands={brands}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            buildHref={buildHref}
            {...sidebarLabels}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/40 p-2.5 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Suspense fallback={<div className="h-10 w-full rounded-full bg-muted sm:max-w-sm" />}>
                <CatalogSearch className="w-full sm:max-w-sm" />
              </Suspense>
              <Suspense fallback={<div className="h-10 w-full rounded-full bg-muted sm:w-44" />}>
                <CatalogSort className="w-full sm:w-auto" />
              </Suspense>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export function CatalogShell(props: React.ComponentProps<typeof CatalogShellInner>) {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}>
      <CatalogShellInner {...props} />
    </Suspense>
  );
}
