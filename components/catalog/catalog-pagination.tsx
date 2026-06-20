"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CatalogPagination({
  page,
  totalPages,
  className,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  className?: string;
}) {
  const t = useTranslations();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function href(targetPage: number) {
    const next = new URLSearchParams(params.toString());
    if (targetPage > 1) {
      next.set("page", String(targetPage));
    } else {
      next.delete("page");
    }
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-2 py-2", className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? (
          <Link href={href(page - 1)}>{t.catalog.previous}</Link>
        ) : (
          <span>{t.catalog.previous}</span>
        )}
      </Button>
      <span className="px-2 text-xs text-muted-foreground sm:text-sm">
        {t.catalog.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <Link href={href(page + 1)}>{t.catalog.next}</Link>
        ) : (
          <span>{t.catalog.next}</span>
        )}
      </Button>
    </nav>
  );
}
