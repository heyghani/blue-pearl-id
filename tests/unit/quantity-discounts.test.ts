import { describe, expect, it } from "vitest";

import {
  applyQuantityDiscount,
  DEFAULT_QUANTITY_PRICE_FACTORS,
  discountPercentFromFactor,
  priceFactorForQuantity,
} from "@/lib/pricing/quantity-discounts";

describe("priceFactorForQuantity", () => {
  it("returns 1 below the smallest configured pack", () => {
    expect(priceFactorForQuantity(1, DEFAULT_QUANTITY_PRICE_FACTORS)).toBe(1);
    expect(priceFactorForQuantity(2, DEFAULT_QUANTITY_PRICE_FACTORS)).toBe(1);
  });

  it("uses the exact pack factor", () => {
    expect(priceFactorForQuantity(3, DEFAULT_QUANTITY_PRICE_FACTORS)).toBe(0.9889);
    expect(priceFactorForQuantity(100, DEFAULT_QUANTITY_PRICE_FACTORS)).toBe(0.9);
  });

  it("uses the next larger pack between sizes", () => {
    expect(priceFactorForQuantity(6, DEFAULT_QUANTITY_PRICE_FACTORS)).toBe(0.95);
  });
});

describe("applyQuantityDiscount", () => {
  it("calculates discounted merchandise for 3 pairs", () => {
    const result = applyQuantityDiscount(240, 3, DEFAULT_QUANTITY_PRICE_FACTORS);

    expect(result.discountedTotal).toBe(237.34);
    expect(result.discountAmount).toBe(2.66);
    expect(result.discountPercent).toBe(1.11);
  });

  it("calculates discounted merchandise for 100 pairs", () => {
    const result = applyQuantityDiscount(8000, 100, DEFAULT_QUANTITY_PRICE_FACTORS);

    expect(result.discountedTotal).toBe(7200);
    expect(result.discountAmount).toBe(800);
    expect(result.discountPercent).toBe(10);
  });
});

describe("discountPercentFromFactor", () => {
  it("converts a price factor into percent off", () => {
    expect(discountPercentFromFactor(0.9889)).toBe(1.11);
    expect(discountPercentFromFactor(0.9)).toBe(10);
  });
});
