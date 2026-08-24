"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

import {
  catalogHref,
  useCatalogBasePath,
} from "@/components/catalog/catalog-base-path";
import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function CatalogViewToggle({ className }: { className?: string }) {
  const t = useTranslations();
  const basePath = useCatalogBasePath();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  function buildHref(nextView: "grid" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (nextView === "grid") {
      params.delete("view");
    } else {
      params.set("view", "list");
    }
    return catalogHref(basePath, params.toString());
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border/70 bg-background p-0.5",
        className,
      )}
      role="group"
      aria-label={t.catalog.viewModeLabel}
    >
      <Link
        href={buildHref("grid")}
        aria-current={view === "grid" ? "true" : undefined}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-sm transition-colors",
          view === "grid"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
        <span className="sr-only">{t.catalog.viewGrid}</span>
      </Link>
      <Link
        href={buildHref("list")}
        aria-current={view === "list" ? "true" : undefined}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-sm transition-colors",
          view === "list"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="h-4 w-4" aria-hidden />
        <span className="sr-only">{t.catalog.viewList}</span>
      </Link>
    </div>
  );
}
