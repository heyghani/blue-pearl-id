"use client";

import Image from "next/image";

import { useState } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { ProductActions } from "@/components/product/product-actions";
import { ProductChosenSizes } from "@/components/product/product-chosen-sizes";
import { ProductQuantityOptions } from "@/components/product/product-quantity-options";
import { ProductTrustModule } from "@/components/product/product-trust-module";
import { useProductVariant } from "@/components/product/product-variant-context";
import { Price } from "@/components/shared/price";
import { formatPrice } from "@/lib/currency";
import {
  findVariantBySelections,
  getVariantCompareAtPrice,
  getVariantDisplayPrice,
  resolveDisplayStockStatus,
  variantSelectionLabel,
  type SerializedProductOption,
  type SerializedProductVariant,
} from "@/lib/products/variants";
import { storefrontQuantityOptions } from "@/lib/shipping/quantity-tiers";
import {
  estimateShippingForQuantity,
  type StorefrontShippingRates,
} from "@/lib/shipping/storefront-rates";
import { ShippingMethodType } from "@prisma/client";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  productName: string;
  basePrice: string;
  compareAtPrice: string | null;
  hasVariants: boolean;
  inStock: boolean;
  stockQuantity: number;
  quantityPacks: number[];
  shippingRates: StorefrontShippingRates;
  options: SerializedProductOption[];
  variants: SerializedProductVariant[];
  layout?: "inline" | "mobile-split";
};

type ChosenSize = { variantId: string; label: string };

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

function countChosenForVariant(chosenSizes: ChosenSize[], variantId: string) {
  return chosenSizes.filter((size) => size.variantId === variantId).length;
}

export function ProductPurchaseSection({
  productId,
  productName,
  basePrice,
  compareAtPrice,
  hasVariants,
  inStock,
  stockQuantity,
  quantityPacks,
  shippingRates,
  options,
  variants,
  layout = "inline",
}: Props) {
  const t = useTranslations();
  const { selections, setSelection, clearSelections, selectedVariant, previewVariant } =
    useProductVariant();
  const selectablePacks = storefrontQuantityOptions(quantityPacks);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [chosenSizes, setChosenSizes] = useState<ChosenSize[]>([]);

  const pricingVariant = selectedVariant ?? previewVariant;
  const unitPrice = getVariantDisplayPrice(pricingVariant, basePrice);
  const unitCompareAt = getVariantCompareAtPrice(pricingVariant, compareAtPrice);
  const stockStatus = resolveDisplayStockStatus({
    hasVariants,
    productInStock: inStock,
    selectedVariant,
  });
  const inStockVariants = variants.filter(
    (variant) => variant.isActive && variant.quantity > 0,
  );
  const totalVariantStock = inStockVariants.reduce(
    (sum, variant) => sum + variant.quantity,
    0,
  );
  const quantity = selectedQuantity;
  const isSizePack = hasVariants && quantity > 1;
  const requiresSelection = isSizePack
    ? chosenSizes.length !== quantity
    : hasVariants && !selectedVariant;
  const maxQuantity = hasVariants ? totalVariantStock : stockQuantity;
  const showInStock = hasVariants ? inStockVariants.length > 0 : stockStatus.inStock;
  const visiblePacks = quantityPacks.length > 0 ? selectablePacks : [];
  const packReady =
    !isSizePack ||
    chosenSizes.every((size) => {
      const variant = variants.find((entry) => entry.id === size.variantId);
      return variant != null && variant.quantity > 0;
    });
  const canPurchase =
    !requiresSelection &&
    packReady &&
    (hasVariants
      ? inStockVariants.length > 0
      : stockStatus.inStock && quantity <= maxQuantity);
  const displayPrice = isSizePack
    ? chosenSizes
        .reduce((sum, size) => {
          const variant = variants.find((entry) => entry.id === size.variantId) ?? null;
          return sum + Number(getVariantDisplayPrice(variant, basePrice));
        }, 0)
        .toFixed(2)
    : (Number(unitPrice) * quantity).toFixed(2);
  const displayCompareAt = isSizePack
    ? (() => {
        const total = chosenSizes.reduce((sum, size) => {
          const variant = variants.find((entry) => entry.id === size.variantId) ?? null;
          const compareAt = getVariantCompareAtPrice(variant, compareAtPrice);
          return compareAt != null ? sum + Number(compareAt) : sum;
        }, 0);
        return total > 0 ? total.toFixed(2) : null;
      })()
    : unitCompareAt != null
      ? (Number(unitCompareAt) * quantity).toFixed(2)
      : null;
  const estimatedShipping = estimateShippingForQuantity(
    quantity,
    ShippingMethodType.STANDARD,
    shippingRates,
  );
  const estimatedExpressShipping = estimateShippingForQuantity(
    quantity,
    ShippingMethodType.EXPRESS,
    shippingRates,
  );
  const estimatedTotal = (Number(displayPrice) + Number(estimatedShipping)).toFixed(2);

  function handleQuantityChange(next: number) {
    setSelectedQuantity(next);
    setChosenSizes((current) => (next <= 1 ? [] : current.slice(0, next)));
    if (next <= 1) clearSelections();
  }

  function handleSelect(optionId: string, value: string) {
    if (isSizePack && chosenSizes.length >= quantity) return;

    setSelection(optionId, value);

    if (!isSizePack) return;

    const variant = findVariantBySelections(variants, options, {
      ...selections,
      [optionId]: value,
    });
    if (!variant || variant.quantity < 1) return;

    const alreadyChosen = countChosenForVariant(chosenSizes, variant.id);
    if (alreadyChosen >= variant.quantity) return;

    setChosenSizes((current) => {
      if (current.length >= quantity) return current;
      return [
        ...current,
        {
          variantId: variant.id,
          label: variantSelectionLabel(variant, options),
        },
      ];
    });
    clearSelections();
  }

  function countChosenForValue(valueId: string) {
    return chosenSizes.filter((size) => {
      const variant = variants.find((entry) => entry.id === size.variantId);
      return variant?.optionValueIds.includes(valueId);
    }).length;
  }

  function isOptionValueSelected(
    option: SerializedProductOption,
    value: string,
    valueId: string,
  ) {
    if (isSizePack) {
      return countChosenForValue(valueId) > 0;
    }
    return selections[option.id] === value;
  }

  const purchaseDetails = (
    <>
      <div className="space-y-3">
        <span
          className={cn(
            "inline-block text-xs font-medium",
            showInStock ? "text-verified-green" : "text-destructive",
          )}
        >
          {showInStock ? t.product.inStock : t.product.outOfStock}
        </span>

        <Price
          amount={displayPrice}
          compareAt={displayCompareAt}
          className="[&_span:first-child]:text-2xl [&_span:first-child]:font-bold sm:[&_span:first-child]:text-3xl"
        />
        {quantity > 1 ? (
          <p className="text-sm text-muted-foreground">
            {t.product.eachPrice.replace("{price}", formatPrice(unitPrice))}
          </p>
        ) : null}
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            {t.product.shippingStandard.replace(
              "{price}",
              formatPrice(estimatedShipping),
            )}
          </p>
          <p>
            {t.product.shippingExpress.replace(
              "{price}",
              formatPrice(estimatedExpressShipping),
            )}
          </p>
          <p className="font-medium text-foreground">
            {t.product.estimatedTotal.replace(
              "{price}",
              formatPrice(estimatedTotal),
            )}
          </p>
        </div>
      </div>

      <ProductQuantityOptions
        packs={visiblePacks}
        value={quantity}
        maxQuantity={maxQuantity}
        shippingRates={shippingRates}
        onChange={handleQuantityChange}
      />

      {hasVariants ? (
        <div className="space-y-4">
          <VariantImagePreview options={options} productName={productName} />

          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              <p className="text-sm font-medium">{option.name}</p>
              {isSizePack ? (
                <p className="text-xs text-muted-foreground">
                  {t.product.selectSizes.replace("{count}", String(quantity))}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const chosenCount = isSizePack ? countChosenForValue(value.id) : 0;
                  const isSelected = isOptionValueSelected(
                    option,
                    value.value,
                    value.id,
                  );
                  const packFull = isSizePack && chosenSizes.length >= quantity;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      disabled={packFull}
                      onClick={() => handleSelect(option.id, value.value)}
                      className={cn(
                        "relative rounded-md border px-3 py-1.5 font-mono text-sm transition-colors",
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-input bg-background hover:border-foreground/40",
                        packFull && "cursor-not-allowed opacity-40 hover:border-input",
                      )}
                    >
                      {value.value}
                      {chosenCount > 1 ? (
                        <span className="ml-1 text-[10px] opacity-80">×{chosenCount}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {isSizePack ? (
            <ProductChosenSizes
              sizes={chosenSizes}
              needed={quantity}
              onRemove={(index) =>
                setChosenSizes((current) => current.filter((_, i) => i !== index))
              }
            />
          ) : selectedVariant ? (
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
        variantIds={
          isSizePack
            ? chosenSizes.map((size) => size.variantId)
            : selectedVariant
              ? [selectedVariant.id]
              : undefined
        }
        value={Number(displayPrice)}
        quantity={isSizePack ? chosenSizes.length : quantity}
        inStock={canPurchase}
        soldOut={
          hasVariants
            ? inStockVariants.length === 0
            : !stockStatus.inStock && !requiresSelection
        }
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
