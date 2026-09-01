import { matchQuantityTier } from "@/lib/shipping/quantity-tiers";

export type QuantityPriceTier = {
  quantity: number;
  priceFactor: number;
};

export const DEFAULT_QUANTITY_PRICE_FACTORS: QuantityPriceTier[] = [
  { quantity: 3, priceFactor: 0.9889 },
  { quantity: 5, priceFactor: 0.9778 },
  { quantity: 10, priceFactor: 0.95 },
  { quantity: 20, priceFactor: 0.9444 },
  { quantity: 50, priceFactor: 0.9278 },
  { quantity: 80, priceFactor: 0.9111 },
  { quantity: 100, priceFactor: 0.9 },
];

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function priceFactorForQuantity(
  quantity: number,
  tiers: QuantityPriceTier[],
): number {
  if (quantity < 1 || tiers.length === 0) return 1;

  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  const smallestPack = sorted[0]?.quantity ?? quantity;
  if (quantity < smallestPack) return 1;

  const matched = matchQuantityTier(
    quantity,
    sorted.map((tier) => ({
      quantity: tier.quantity,
      standardPrice: 0,
      expressPrice: 0,
    })),
  );

  if (!matched) return 1;

  const tier = sorted.find((entry) => entry.quantity === matched.quantity);
  return tier?.priceFactor ?? 1;
}

export function discountPercentFromFactor(priceFactor: number) {
  return roundMoney(Math.max(0, (1 - priceFactor) * 100));
}

export function listPricePercentFromFactor(priceFactor: number) {
  return roundMoney(Math.max(0, priceFactor * 100));
}

export function applyQuantityDiscount(
  undiscountedTotal: number,
  quantity: number,
  tiers: QuantityPriceTier[],
) {
  const priceFactor = priceFactorForQuantity(quantity, tiers);
  const discountedTotal = roundMoney(undiscountedTotal * priceFactor);
  const discountAmount = roundMoney(Math.max(0, undiscountedTotal - discountedTotal));

  return {
    priceFactor,
    discountedTotal,
    discountAmount,
    discountPercent: discountPercentFromFactor(priceFactor),
    listPricePercent: listPricePercentFromFactor(priceFactor),
  };
}

export function toQuantityPriceTier(tier: {
  quantity: number;
  priceFactor: { toString(): string } | number | string;
}): QuantityPriceTier {
  return {
    quantity: tier.quantity,
    priceFactor: Number(tier.priceFactor),
  };
}
