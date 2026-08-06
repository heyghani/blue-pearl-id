"use client";

import { Lock } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function CheckoutSecureNotice({ className }: { className?: string }) {
  const t = useTranslations();

  return (
    <p
      className={cn(
        "flex items-center justify-center gap-2 text-center text-xs text-muted-foreground",
        className,
      )}
    >
      <Lock className="h-3.5 w-3.5 shrink-0 text-verified-green" aria-hidden />
      <span>{t.checkout.secureCheckout}</span>
    </p>
  );
}
