import { ShippingMethodType } from "@prisma/client";

export const SINGLE_PAIR_QUANTITY = 1;
export const DEFAULT_QUANTITY_PACKS = [3, 5, 10, 20, 50] as const;
export const MAX_ORDER_QUANTITY = 999;

export type QuantityTierPrices = {
  quantity: number;
  standardPrice: number;
  expressPrice: number;
  priceFactor?: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function sortQuantityPacks(packs: number[]) {
  return [...new Set(packs.filter((quantity) => quantity > 0))].sort(
    (a, b) => a - b,
  );
}

/** Always include a single pair so bulk packs stay optional. */
export function storefrontQuantityOptions(packs: number[]) {
  return sortQuantityPacks([SINGLE_PAIR_QUANTITY, ...packs]);
}

/** Next configured pack in `direction`, or null if none. Falls back to ±1 when no packs. */
export function adjacentQuantity(
  current: number,
  packs: number[],
  direction: 1 | -1,
): number | null {
  const sorted = sortQuantityPacks(packs);

  if (sorted.length === 0) {
    const next = current + direction;
    return next >= 1 && next <= MAX_ORDER_QUANTITY ? next : null;
  }

  if (direction === 1) {
    return sorted.find((quantity) => quantity > current) ?? null;
  }

  return [...sorted].reverse().find((quantity) => quantity < current) ?? null;
}

/**
 * Pick the shipping pack for a cart quantity:
 * exact match, else the smallest pack that covers the cart (ceiling),
 * else the largest pack (caller may scale above it).
 */
export function matchQuantityTier(
  cartQuantity: number,
  tiers: QuantityTierPrices[],
): QuantityTierPrices | null {
  if (cartQuantity < 1 || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  const exact = sorted.find((tier) => tier.quantity === cartQuantity);
  if (exact) return exact;

  const ceiling = sorted.find((tier) => tier.quantity >= cartQuantity);
  if (ceiling) return ceiling;

  return sorted[sorted.length - 1] ?? null;
}

export function priceForShippingMethod(
  method: ShippingMethodType,
  cartQuantity: number,
  fallbackPrice: number,
  tiers: QuantityTierPrices[],
): number {
  if (tiers.length === 0) return fallbackPrice;

  const matched = matchQuantityTier(cartQuantity, tiers);
  if (!matched) return fallbackPrice;

  const smallestPack = Math.min(...tiers.map((tier) => tier.quantity));
  if (cartQuantity < smallestPack) return fallbackPrice;

  const packPrice =
    method === ShippingMethodType.EXPRESS
      ? matched.expressPrice
      : matched.standardPrice;

  if (cartQuantity <= matched.quantity) return roundMoney(packPrice);

  return roundMoney(packPrice * (cartQuantity / matched.quantity));
}

export function toQuantityTierPrices(tier: {
  quantity: number;
  standardPrice: { toString(): string } | number | string;
  expressPrice: { toString(): string } | number | string;
  priceFactor?: { toString(): string } | number | string;
}): QuantityTierPrices {
  return {
    quantity: tier.quantity,
    standardPrice: Number(tier.standardPrice),
    expressPrice: Number(tier.expressPrice),
    priceFactor:
      tier.priceFactor != null ? Number(tier.priceFactor) : undefined,
  };
}
