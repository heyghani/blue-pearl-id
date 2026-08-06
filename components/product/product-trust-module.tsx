"use client";

import { Package, RotateCcw } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProductTrustModule({ className }: { className?: string }) {
  const t = useTranslations();

  const items = [
    { icon: RotateCcw, text: t.product.trustReturns },
    { icon: Package, text: t.product.trustShipping },
  ] as const;

  return (
    <ul className={cn("space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5", className)}>
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-2.5 text-xs leading-snug text-muted-foreground sm:text-sm">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-verified-green" aria-hidden />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
