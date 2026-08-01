import Link from "next/link";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  href,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-foreground/20 hover:bg-muted/30",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      {content}
    </div>
  );
}
