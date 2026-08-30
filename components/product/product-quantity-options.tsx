"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function ProductQuantityOptions({
  packs,
  value,
  maxQuantity,
  onChange,
}: {
  packs: number[];
  value: number;
  maxQuantity: number;
  onChange: (quantity: number) => void;
}) {
  const t = useTranslations();

  if (packs.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t.product.quantityLabel}</p>
      <div className="flex flex-wrap gap-2">
        {packs.map((quantity) => {
          const isSelected = value === quantity;
          const exceedsStock = quantity > maxQuantity;
          return (
            <button
              key={quantity}
              type="button"
              disabled={exceedsStock}
              onClick={() => onChange(quantity)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-input bg-background hover:border-foreground/40",
                exceedsStock && "cursor-not-allowed opacity-40 hover:border-input",
              )}
            >
              {(quantity === 1 ? t.product.packLabelOne : t.product.packLabel).replace(
                "{count}",
                String(quantity),
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
