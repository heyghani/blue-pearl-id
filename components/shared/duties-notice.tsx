"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function DutiesNotice({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      {t.common.taxNotice}
    </p>
  );
}
