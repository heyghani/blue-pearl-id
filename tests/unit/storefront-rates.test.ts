import { describe, expect, it } from "vitest";
import { ShippingMethodType } from "@prisma/client";

import {
  estimateShippingForQuantity,
  shippingForPackQuantity,
  type StorefrontShippingRates,
} from "@/lib/shipping/storefront-rates";

const rates: StorefrontShippingRates = {
  tiers: [
    { quantity: 3, standardPrice: "10.00", expressPrice: "35.00" },
    { quantity: 5, standardPrice: "10.00", expressPrice: "35.00" },
    { quantity: 10, standardPrice: "10.00", expressPrice: "35.00" },
    { quantity: 20, standardPrice: "10.00", expressPrice: "35.00" },
  ],
  standardFallback: "15.00",
  expressFallback: "35.00",
};

describe("estimateShippingForQuantity", () => {
  it("uses admin pack prices for bulk quantities", () => {
    expect(
      estimateShippingForQuantity(3, ShippingMethodType.STANDARD, rates),
    ).toBe("10.00");
    expect(
      estimateShippingForQuantity(3, ShippingMethodType.EXPRESS, rates),
    ).toBe("35.00");
  });

  it("uses fallback rates for a single pair", () => {
    expect(
      estimateShippingForQuantity(1, ShippingMethodType.STANDARD, rates),
    ).toBe("15.00");
  });

  it("settles cart totals from combined pair count", () => {
    expect(
      estimateShippingForQuantity(6, ShippingMethodType.STANDARD, rates),
    ).toBe("10.00");
  });
});

describe("shippingForPackQuantity", () => {
  it("returns both methods for quantity pills", () => {
    expect(shippingForPackQuantity(5, rates)).toEqual({
      standard: "10.00",
      express: "35.00",
    });
  });
});
