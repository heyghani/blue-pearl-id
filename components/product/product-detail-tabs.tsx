"use client";

import { useState } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface ProductDetailTabsProps {
  description: string | null;
  specs: Record<string, string> | null;
}

export function ProductDetailTabs({
  description,
  specs,
}: ProductDetailTabsProps) {
  const t = useTranslations();
  const hasSpecs = specs && Object.keys(specs).length > 0;
  const [active, setActive] = useState<"description" | "specs">("description");

  const tabs = [
    { id: "description" as const, label: t.product.description },
    ...(hasSpecs
      ? [{ id: "specs" as const, label: t.product.specifications }]
      : []),
  ];

  return (
    <section className="mt-8">
      {tabs.length > 1 ? (
        <div className="flex gap-1 rounded-full bg-muted/60 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                active === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <h2 className="text-base font-bold">{t.product.description}</h2>
      )}

      <div className="mt-4">
        {active === "description" || !hasSpecs ? (
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {description ? (
              description.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))
            ) : (
              <p>{t.product.noDescription}</p>
            )}
          </div>
        ) : (
          <dl className="divide-y rounded-2xl border bg-card">
            {Object.entries(specs!).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 px-4 py-3 text-sm"
              >
                <dt className="font-medium text-foreground">{key}</dt>
                <dd className="text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
