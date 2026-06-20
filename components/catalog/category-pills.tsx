"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface Category {
  slug: string;
  name: string;
  _count?: { products: number };
}

export function CategoryPills({
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

  function buildHref(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (slug === null) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }

    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  const pills = [
    { slug: null, label: t.catalog.allProducts },
    ...categories.map((c) => ({ slug: c.slug, label: c.name })),
  ];

  return (
    <div
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {pills.map((pill) => {
        const isActive =
          pill.slug === null
            ? activeSlugs.size === 0
            : activeSlugs.has(pill.slug);

        return (
          <Link
            key={pill.slug ?? "all"}
            href={buildHref(pill.slug)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {pill.label}
          </Link>
        );
      })}
    </div>
  );
}
