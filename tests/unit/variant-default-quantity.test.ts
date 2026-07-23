import { describe, expect, it } from "vitest";

import {
  deriveVariantDefaultQuantity,
  generateVariantCombinations,
  variantCombinationKey,
} from "@/lib/products/variants";

describe("deriveVariantDefaultQuantity", () => {
  it("returns the shared quantity when all variants match", () => {
    expect(
      deriveVariantDefaultQuantity([{ quantity: 99 }, { quantity: 99 }], 0),
    ).toBe(99);
  });

  it("returns the most common quantity when values differ", () => {
    expect(
      deriveVariantDefaultQuantity(
        [{ quantity: 99 }, { quantity: 99 }, { quantity: 10 }],
        0,
      ),
    ).toBe(99);
  });

  it("returns fallback when there are no variants", () => {
    expect(deriveVariantDefaultQuantity([], 42)).toBe(42);
  });
});

describe("generateVariantCombinations default quantity", () => {
  it("applies inventory quantity to generated variants", () => {
    const variants = generateVariantCombinations(
      [{ name: "Color", values: ["Red", "Blue"] }],
      "SKU",
      120,
      99,
    );

    expect(variants).toHaveLength(2);
    expect(variants.every((variant) => variant.quantity === 99)).toBe(true);
  });
});

describe("variantCombinationKey", () => {
  it("is stable regardless of option order", () => {
    expect(variantCombinationKey({ Size: "40", Color: "Red" })).toBe(
      variantCombinationKey({ Color: "Red", Size: "40" }),
    );
  });
});
