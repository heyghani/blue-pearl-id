"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PriceFilter({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeMin = searchParams.get("minPrice") ?? "";
  const activeMax = searchParams.get("maxPrice") ?? "";

  const [minPrice, setMinPrice] = useState(activeMin);
  const [maxPrice, setMaxPrice] = useState(activeMax);

  useEffect(() => {
    setMinPrice(activeMin);
    setMaxPrice(activeMax);
  }, [activeMin, activeMax]);

  function applyFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const min = minPrice.trim();
    const max = maxPrice.trim();

    if (min) params.set("minPrice", min);
    else params.delete("minPrice");

    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  function clearFilter() {
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("minPrice");
    params.delete("maxPrice");
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  const hasActive = Boolean(activeMin || activeMax);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
        {t.catalog.priceRange}
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[5.5rem] flex-1 space-y-1">
          <span className="text-[10px] text-muted-foreground">{t.catalog.minPrice}</span>
          <input
            type="number"
            min={0}
            step="1"
            inputMode="decimal"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="0"
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm tabular-nums outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="min-w-[5.5rem] flex-1 space-y-1">
          <span className="text-[10px] text-muted-foreground">{t.catalog.maxPrice}</span>
          <input
            type="number"
            min={0}
            step="1"
            inputMode="decimal"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="999"
            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm tabular-nums outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button type="button" size="sm" className="h-9 shrink-0" onClick={applyFilter}>
          {t.catalog.applyPrice}
        </Button>
        {hasActive ? (
          <Button type="button" size="sm" variant="ghost" className="h-9 shrink-0" onClick={clearFilter}>
            {t.catalog.clearPrice}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
