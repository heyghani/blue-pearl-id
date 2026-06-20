"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CatalogSearch({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQuery = searchParams.get("q") ?? "";

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <form
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateQuery((formData.get("q") as string)?.trim() ?? "");
      }}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        defaultValue={currentQuery}
        placeholder={t.catalog.searchPlaceholder}
        className="rounded-full pl-9 pr-9"
        aria-label={t.nav.search}
      />
      {currentQuery && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={() => updateQuery("")}
          aria-label={t.catalog.clearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {isPending && <span className="sr-only">{t.catalog.searchPlaceholder}</span>}
    </form>
  );
}
