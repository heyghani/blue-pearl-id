import { ShippingMethodType } from "@prisma/client";

import {
  applyQuantityDiscount,
  type QuantityPriceTier,
} from "@/lib/pricing/quantity-discounts";
import {
  priceForShippingMethod,
  toQuantityTierPrices,
  type QuantityTierPrices,
} from "@/lib/shipping/quantity-tiers";

export type StorefrontShippingTier = {
  quantity: number;
  standardPrice: string;
  expressPrice: string;
  priceFactor: string;
};

export type StorefrontShippingRates = {
  tiers: StorefrontShippingTier[];
  standardFallback: string;
  expressFallback: string;
};

function toTierPrices(rates: StorefrontShippingRates): QuantityTierPrices[] {
  return rates.tiers.map((tier) => ({
    quantity: tier.quantity,
    standardPrice: Number(tier.standardPrice),
    expressPrice: Number(tier.expressPrice),
    priceFactor: Number(tier.priceFactor),
  }));
}

export function quantityPriceTiersFromStorefront(
  rates: StorefrontShippingRates,
): QuantityPriceTier[] {
  return rates.tiers.map((tier) => ({
    quantity: tier.quantity,
    priceFactor: Number(tier.priceFactor),
  }));
}

export function estimateShippingForQuantity(
  quantity: number,
  method: ShippingMethodType,
  rates: StorefrontShippingRates,
): string {
  const fallback =
    method === ShippingMethodType.EXPRESS
      ? Number(rates.expressFallback)
      : Number(rates.standardFallback);

  return priceForShippingMethod(
    method,
    quantity,
    fallback,
    toTierPrices(rates),
  ).toFixed(2);
}

export function shippingForPackQuantity(
  quantity: number,
  rates: StorefrontShippingRates,
) {
  return {
    standard: estimateShippingForQuantity(
      quantity,
      ShippingMethodType.STANDARD,
      rates,
    ),
    express: estimateShippingForQuantity(
      quantity,
      ShippingMethodType.EXPRESS,
      rates,
    ),
  };
}

export function merchandiseDiscountForQuantity(
  undiscountedTotal: number,
  quantity: number,
  rates: StorefrontShippingRates,
) {
  return applyQuantityDiscount(
    undiscountedTotal,
    quantity,
    quantityPriceTiersFromStorefront(rates),
  );
}

export function serializeShippingTiers(
  tiers: {
    quantity: number;
    standardPrice: { toString(): string };
    expressPrice: { toString(): string };
    priceFactor: { toString(): string };
  }[],
): StorefrontShippingTier[] {
  return tiers.map((tier) => ({
    quantity: tier.quantity,
    standardPrice: tier.standardPrice.toString(),
    expressPrice: tier.expressPrice.toString(),
    priceFactor: tier.priceFactor.toString(),
  }));
}

export function tierPricesFromStorefront(
  rates: StorefrontShippingRates,
): QuantityTierPrices[] {
  return rates.tiers.map(toQuantityTierPrices);
}
