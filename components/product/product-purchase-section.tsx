"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { ProductActions } from "@/components/product/product-actions";
import { Price } from "@/components/shared/price";
import {
  findVariantBySelections,
  getVariantCompareAtPrice,
  getVariantDisplayPrice,
  type SerializedProductOption,
  type SerializedProductVariant,
  variantInStock,
} from "@/lib/products/variants";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  basePrice: string;
  compareAtPrice: string | null;
  hasVariants: boolean;
  inStock: boolean;
  options: SerializedProductOption[];
  variants: SerializedProductVariant[];
  layout?: "inline" | "mobile-split";
};

export function ProductPurchaseSection({
  productId,
  basePrice,
  compareAtPrice,
  hasVariants,
  inStock,
  options,
  variants,
  layout = "inline",
}: Props) {
  const t = useTranslations();
  const [selections, setSelections] = useState<Record<string, string>>({});

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return findVariantBySelections(variants, options, selections);
  }, [hasVariants, options, selections, variants]);

  const displayPrice = getVariantDisplayPrice(selectedVariant, basePrice);
  const displayCompareAt = getVariantCompareAtPrice(selectedVariant, compareAtPrice);
  const canPurchase = hasVariants
    ? Boolean(selectedVariant && variantInStock(selectedVariant))
    : inStock;
  const requiresSelection = hasVariants && !selectedVariant;

  function handleSelect(optionId: string, value: string) {
    setSelections((current) => ({ ...current, [optionId]: value }));
  }

  const purchaseDetails = (
    <>
      <Price
        amount={displayPrice}
        compareAt={displayCompareAt}
        className="[&_span:first-child]:text-2xl [&_span:first-child]:font-bold sm:[&_span:first-child]:text-3xl"
      />

      {hasVariants ? (
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              <p className="text-sm font-medium">{option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selections[option.id] === value.value;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => handleSelect(option.id, value.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-input bg-background hover:border-foreground/40",
                      )}
                    >
                      {value.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedVariant ? (
            <p className="text-xs text-muted-foreground">
              SKU: <span className="font-mono">{selectedVariant.sku}</span>
              {" · "}
              {variantInStock(selectedVariant) ? t.product.inStock : t.product.outOfStock}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t.product.selectOptions}</p>
          )}
        </div>
      ) : null}
    </>
  );

  const actions = (
    <ProductActions
      productId={productId}
      variantId={selectedVariant?.id}
      inStock={canPurchase}
      requiresSelection={requiresSelection}
      layout={layout === "mobile-split" ? "sticky" : "inline"}
    />
  );

  if (layout === "mobile-split") {
    return (
      <>
        <div className="space-y-5">{purchaseDetails}</div>
        {actions}
      </>
    );
  }

  return (
    <div className="space-y-5">
      {purchaseDetails}
      {actions}
    </div>
  );
}
