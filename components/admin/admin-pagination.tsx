import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildHref(
  pathname: string,
  page: number,
  query?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === "page") continue;
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Compact page window: 1 … 4 5 6 … N */
export function getPageWindow(current: number, total: number, radius = 1) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (let i = current - radius; i <= current + radius; i += 1) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i]!;
    const prev = sorted[i - 1];
    if (prev !== undefined && page - prev > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }

  return result;
}

export function AdminPagination({
  pathname,
  page,
  totalPages,
  total,
  pageSize,
  query,
  className,
}: {
  pathname: string;
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  query?: Record<string, string | undefined>;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const windowed = getPageWindow(current, totalPages);
  const from =
    total !== undefined && pageSize
      ? Math.min((current - 1) * pageSize + 1, total)
      : null;
  const to =
    total !== undefined && pageSize
      ? Math.min(current * pageSize, total)
      : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {from !== null && to !== null && total !== undefined ? (
          <>
            Showing <span className="font-medium text-foreground">{from}–{to}</span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
          </>
        ) : (
          <>
            Page <span className="font-medium text-foreground">{current}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5"
          disabled={current <= 1}
          asChild={current > 1}
        >
          {current > 1 ? (
            <Link href={buildHref(pathname, current - 1, query)}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </span>
          )}
        </Button>

        {windowed.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`e-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <Button
              key={entry}
              variant={entry === current ? "default" : "outline"}
              size="sm"
              className="h-8 min-w-8 px-2"
              asChild={entry !== current}
            >
              {entry === current ? (
                <span>{entry}</span>
              ) : (
                <Link href={buildHref(pathname, entry, query)}>{entry}</Link>
              )}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5"
          disabled={current >= totalPages}
          asChild={current < totalPages}
        >
          {current < totalPages ? (
            <Link href={buildHref(pathname, current + 1, query)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
