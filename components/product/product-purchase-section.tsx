"use client";

import Image from "next/image";

import { useTranslations } from "@/components/i18n/locale-provider";
import { ProductActions } from "@/components/product/product-actions";
import { ProductTrustModule } from "@/components/product/product-trust-module";
import { useProductVariant } from "@/components/product/product-variant-context";
import { Price } from "@/components/shared/price";
import {
  getVariantCompareAtPrice,
  getVariantDisplayPrice,
  resolveDisplayStockStatus,
  type SerializedProductOption,
} from "@/lib/products/variants";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  productName: string;
  basePrice: string;
  compareAtPrice: string | null;
  hasVariants: boolean;
  inStock: boolean;
  options: SerializedProductOption[];
  layout?: "inline" | "mobile-split";
};

function VariantImagePreview({
  options,
  productName,
}: {
  options: SerializedProductOption[];
  productName: string;
}) {
  const t = useTranslations();
  const { activeImageUrl, previewVariant, selectedVariant, selections } = useProductVariant();
  const hasSelection = Object.keys(selections).length > 0;

  if (!hasSelection || !activeImageUrl) return null;

  const label = options
    .map((option) => selections[option.id])
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-2 lg:hidden">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={activeImageUrl}
          alt={label || productName}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground">
          {selectedVariant ? label : t.product.variantPreview}
        </p>
        {previewVariant && !selectedVariant ? (
          <p className="text-xs text-muted-foreground">{t.product.selectOptions}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ProductPurchaseSection({
  productId,
  productName,
  basePrice,
  compareAtPrice,
  hasVariants,
  inStock,
  options,
  layout = "inline",
}: Props) {
  const t = useTranslations();
  const { selections, setSelection, selectedVariant, previewVariant } = useProductVariant();

  const pricingVariant = selectedVariant ?? previewVariant;
  const displayPrice = getVariantDisplayPrice(pricingVariant, basePrice);
  const displayCompareAt = getVariantCompareAtPrice(pricingVariant, compareAtPrice);
  const stockStatus = resolveDisplayStockStatus({
    hasVariants,
    productInStock: inStock,
    selectedVariant,
  });
  const requiresSelection = hasVariants && !selectedVariant;
  const canPurchase = !requiresSelection && stockStatus.inStock;

  function handleSelect(optionId: string, value: string) {
    setSelection(optionId, value);
  }

  const purchaseDetails = (
    <>
      <div className="space-y-3">
        <span
          className={cn(
            "inline-block text-xs font-medium",
            stockStatus.inStock ? "text-verified-green" : "text-destructive",
          )}
        >
          {stockStatus.inStock ? t.product.inStock : t.product.outOfStock}
        </span>

        <Price
          amount={displayPrice}
          compareAt={displayCompareAt}
          className="[&_span:first-child]:text-2xl [&_span:first-child]:font-bold sm:[&_span:first-child]:text-3xl"
        />
      </div>

      {hasVariants ? (
        <div className="space-y-4">
          <VariantImagePreview options={options} productName={productName} />

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
                        "rounded-md border px-3 py-1.5 font-mono text-sm transition-colors",
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
            <p className="font-mono text-xs text-muted-foreground">
              SKU: {selectedVariant.sku}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t.product.selectOptions}</p>
          )}
        </div>
      ) : null}
    </>
  );

  const actions = (
    <>
      <ProductActions
        productId={productId}
        variantId={selectedVariant?.id}
        value={Number(displayPrice)}
        inStock={canPurchase}
        soldOut={!stockStatus.inStock && !requiresSelection}
        requiresSelection={requiresSelection}
        layout={layout === "mobile-split" ? "sticky" : "inline"}
      />
      {layout === "inline" ? <ProductTrustModule /> : null}
    </>
  );

  if (layout === "mobile-split") {
    return (
      <>
        <div className="space-y-5">{purchaseDetails}</div>
        {actions}
        <ProductTrustModule className="mt-5" />
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
