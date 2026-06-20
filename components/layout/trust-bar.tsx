"use client";

import { Lock, Plane, RotateCcw } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";

export function TrustBar() {
  const t = useTranslations();

  const items = [
    { icon: Lock, label: t.trust.secure },
    { icon: Plane, label: t.trust.shipping },
    { icon: RotateCcw, label: t.trust.returns },
  ];

  return (
    <section className="border-y bg-[var(--pearl-light)]/40">
      <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-5 sm:justify-center sm:gap-12 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex shrink-0 items-center gap-2 text-sm font-medium text-foreground/80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm">
              <Icon className="h-4 w-4 text-[var(--pearl)]" aria-hidden />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
