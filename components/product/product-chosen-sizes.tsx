"use client";

import { X } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";

export function ProductChosenSizes({
  sizes,
  needed,
  onRemove,
}: {
  sizes: { variantId: string; label: string }[];
  needed: number;
  onRemove: (index: number) => void;
}) {
  const t = useTranslations();

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t.product.sizesChosen
          .replace("{chosen}", String(sizes.length))
          .replace("{count}", String(needed))}
      </p>
      {sizes.length > 0 ? (
        <ul className="space-y-2">
          {sizes.map((size, index) => (
            <li
              key={`${size.variantId}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2"
            >
              <span className="text-sm font-medium">
                {index + 1}. {size.label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(index)}
                aria-label={t.product.removeSize}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {sizes.length < needed ? (
        <p className="text-sm text-muted-foreground">{t.product.addAnotherSize}</p>
      ) : null}
    </div>
  );
}
