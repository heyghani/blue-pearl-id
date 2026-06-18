"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { SORT_OPTIONS } from "@/lib/catalog";
import type { ProductSort } from "@/lib/products";
import { cn } from "@/lib/utils";

export function CatalogSort({ className }: { className?: string }) {
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
        "h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isPending && "opacity-60",
        className,
      )}
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
