"use client";

import { Suspense } from "react";

import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { cn } from "@/lib/utils";

export function CatalogToolbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mx-4 border-b bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<div className="h-10 w-full rounded-full bg-muted sm:max-w-sm" />}>
          <CatalogSearch className="w-full sm:max-w-sm" />
        </Suspense>
        <Suspense fallback={<div className="h-10 w-full rounded-full bg-muted sm:w-44" />}>
          <CatalogSort className="w-full sm:w-auto" />
        </Suspense>
      </div>
    </div>
  );
}
