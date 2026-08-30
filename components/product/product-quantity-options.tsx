"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { formatPrice } from "@/lib/currency";
import {
  shippingForPackQuantity,
  type StorefrontShippingRates,
} from "@/lib/shipping/storefront-rates";
import { cn } from "@/lib/utils";

export function ProductQuantityOptions({
  packs,
  value,
  maxQuantity,
  shippingRates,
  onChange,
}: {
  packs: number[];
  value: number;
  maxQuantity: number;
  shippingRates: StorefrontShippingRates;
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
          const shipping = shippingForPackQuantity(quantity, shippingRates);
          return (
            <button
              key={quantity}
              type="button"
              disabled={exceedsStock}
              onClick={() => onChange(quantity)}
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center rounded-md border px-3 py-1.5 text-sm transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-input bg-background hover:border-foreground/40",
                exceedsStock && "cursor-not-allowed opacity-40 hover:border-input",
              )}
            >
              <span>
                {(quantity === 1 ? t.product.packLabelOne : t.product.packLabel).replace(
                  "{count}",
                  String(quantity),
                )}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[11px] font-normal",
                  isSelected ? "text-background/80" : "text-muted-foreground",
                )}
              >
                {t.product.packShippingStandard.replace(
                  "{price}",
                  formatPrice(shipping.standard),
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
