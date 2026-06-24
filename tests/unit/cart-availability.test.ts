import { describe, expect, it } from "vitest";

import { getItemAvailability } from "@/lib/cart/availability";

describe("getItemAvailability", () => {
  it("treats simple products without inventory as in stock", () => {
    const result = getItemAvailability({
      product: {
        isActive: true,
        deletedAt: null,
        hasVariants: false,
        inventory: null,
      },
      variant: null,
    });

    expect(result.inStock).toBe(true);
    expect(result.maxQuantity).toBe(99);
  });

  it("uses variant stock for variant products instead of zero product inventory", () => {
    const result = getItemAvailability({
      product: {
        isActive: true,
        deletedAt: null,
        hasVariants: true,
        inventory: { quantity: 0 },
      },
      variant: { quantity: 5, isActive: true },
    });

    expect(result.inStock).toBe(true);
    expect(result.maxQuantity).toBe(5);
  });

  it("marks variant products without a selected variant as unavailable", () => {
    const result = getItemAvailability({
      product: {
        isActive: true,
        deletedAt: null,
        hasVariants: true,
        inventory: { quantity: 10 },
      },
      variant: null,
    });

    expect(result.inStock).toBe(false);
    expect(result.maxQuantity).toBe(0);
  });
});
