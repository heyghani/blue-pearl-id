"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { SORT_OPTIONS } from "@/lib/catalog";
import type { ProductSort } from "@/lib/products";
import { cn } from "@/lib/utils";

export function CatalogSort({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = (searchParams.get("sort") as ProductSort) || "newest";

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        params.delete("page");
        startTransition(() => {
          router.push(`/products?${params.toString()}`);
        });
      }}
      className={cn(
        "h-10 rounded-full border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isPending && "opacity-60",
        className,
      )}
      aria-label={t.catalog.sortLabel}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {t.catalog[option.labelKey]}
        </option>
      ))}
    </select>
  );
}
