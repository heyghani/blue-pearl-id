"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface Category {
  slug: string;
  name: string;
  _count: { products: number };
}

export function CategoryFilter({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const activeSlugs = new Set(
    (searchParams.get("category") ?? "").split(",").filter(Boolean),
  );

  function buildHref(toggledSlug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (toggledSlug === null) {
      params.delete("category");
    } else {
      const current = new Set(
        (searchParams.get("category") ?? "").split(",").filter(Boolean),
      );
      if (current.has(toggledSlug)) {
        current.delete(toggledSlug);
      } else {
        current.add(toggledSlug);
      }
      if (current.size === 0) {
        params.delete("category");
      } else {
        params.set("category", [...current].join(","));
      }
    }

    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-sm font-medium">{t.catalog.categories}</h2>
      <ul className="space-y-1">
        <li>
          <Link
            href={buildHref(null)}
            className={cn(
              "block rounded-full px-3 py-2 text-sm transition-colors",
              activeSlugs.size === 0
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t.catalog.allProducts}
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = activeSlugs.has(category.slug);
          return (
            <li key={category.slug}>
              <Link
                href={buildHref(category.slug)}
                className={cn(
                  "flex items-center justify-between rounded-full px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category._count.products}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
