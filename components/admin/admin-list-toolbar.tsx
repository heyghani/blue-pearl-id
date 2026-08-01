import Link from "next/link";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AdminListToolbar({
  action,
  searchName = "search",
  searchDefault = "",
  searchPlaceholder = "Search…",
  clearHref,
  hasFilters = false,
  hiddenFields,
  filters,
  className,
}: {
  action?: string;
  searchName?: string;
  searchDefault?: string;
  searchPlaceholder?: string;
  clearHref?: string;
  hasFilters?: boolean;
  /** Extra query params to keep when submitting search (e.g. status, category). */
  hiddenFields?: Record<string, string | undefined>;
  filters?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <form
        method="get"
        action={action}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        {hiddenFields
          ? Object.entries(hiddenFields).map(([key, value]) =>
              value ? (
                <input key={key} type="hidden" name={key} value={value} />
              ) : null,
            )
          : null}
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name={searchName}
            type="search"
            defaultValue={searchDefault}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {hasFilters && clearHref ? (
            <Button type="button" variant="ghost" asChild>
              <Link href={clearHref}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
      {filters}
    </div>
  );
}

export function AdminFilterChips({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function AdminFilterChip({
  href,
  active,
  children,
  count,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
      {typeof count === "number" ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
            active ? "bg-background/20" : "bg-muted",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
