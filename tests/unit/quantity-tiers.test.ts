import { describe, expect, it } from "vitest";
import { ShippingMethodType } from "@prisma/client";

import {
  adjacentQuantity,
  matchQuantityTier,
  priceForShippingMethod,
  storefrontQuantityOptions,
} from "@/lib/shipping/quantity-tiers";

const tiers = [
  { quantity: 3, standardPrice: 20, expressPrice: 40 },
  { quantity: 5, standardPrice: 28, expressPrice: 52 },
  { quantity: 10, standardPrice: 40, expressPrice: 70 },
  { quantity: 20, standardPrice: 65, expressPrice: 110 },
  { quantity: 50, standardPrice: 120, expressPrice: 190 },
];

describe("matchQuantityTier", () => {
  it("returns an exact pack match", () => {
    expect(matchQuantityTier(10, tiers)?.quantity).toBe(10);
  });

  it("uses the next larger pack when the cart is between sizes", () => {
    expect(matchQuantityTier(8, tiers)?.quantity).toBe(10);
  });

  it("uses the largest pack when the cart exceeds every size", () => {
    expect(matchQuantityTier(80, tiers)?.quantity).toBe(50);
  });

  it("returns null for an empty tier list", () => {
    expect(matchQuantityTier(3, [])).toBeNull();
  });
});

describe("priceForShippingMethod", () => {
  it("falls back to the method price when no packs exist", () => {
    expect(
      priceForShippingMethod(ShippingMethodType.STANDARD, 10, 15, []),
    ).toBe(15);
  });

  it("uses the method price for a single pair when packs start above 1", () => {
    expect(
      priceForShippingMethod(ShippingMethodType.STANDARD, 1, 15, tiers),
    ).toBe(15);
  });

  it("uses the matching pack price", () => {
    expect(
      priceForShippingMethod(ShippingMethodType.STANDARD, 5, 15, tiers),
    ).toBe(28);
    expect(
      priceForShippingMethod(ShippingMethodType.EXPRESS, 5, 35, tiers),
    ).toBe(52);
  });

  it("charges the next pack when quantity falls between sizes", () => {
    expect(
      priceForShippingMethod(ShippingMethodType.STANDARD, 7, 15, tiers),
    ).toBe(40);
  });

  it("scales the largest pack when quantity exceeds it", () => {
    expect(
      priceForShippingMethod(ShippingMethodType.STANDARD, 100, 15, tiers),
    ).toBe(240);
  });
});

describe("storefrontQuantityOptions", () => {
  it("always includes a single pair ahead of bulk packs", () => {
    expect(storefrontQuantityOptions([3, 5, 10])).toEqual([1, 3, 5, 10]);
  });

  it("does not duplicate a 1-pair pack from admin", () => {
    expect(storefrontQuantityOptions([1, 3, 5])).toEqual([1, 3, 5]);
  });
});

describe("adjacentQuantity", () => {
  const packs = [3, 5, 10, 20, 50];

  it("steps to the next configured pack", () => {
    expect(adjacentQuantity(5, packs, 1)).toBe(10);
    expect(adjacentQuantity(5, packs, -1)).toBe(3);
  });

  it("returns null at the ends of the pack list", () => {
    expect(adjacentQuantity(3, packs, -1)).toBeNull();
    expect(adjacentQuantity(50, packs, 1)).toBeNull();
  });

  it("steps down to a single pair when 1 is included", () => {
    expect(adjacentQuantity(3, storefrontQuantityOptions(packs), -1)).toBe(1);
  });

  it("falls back to plus or minus one when no packs are configured", () => {
    expect(adjacentQuantity(2, [], 1)).toBe(3);
    expect(adjacentQuantity(1, [], -1)).toBeNull();
  });
});
