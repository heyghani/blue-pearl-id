import { describe, expect, it } from "vitest";

import {
  deriveVariantDefaultQuantity,
  generateVariantCombinations,
  getDefaultProductVariantState,
  variantCombinationKey,
} from "@/lib/products/variants";

describe("getDefaultProductVariantState", () => {
  it("pre-fills US sizes from US4 to US12 including half sizes", () => {
    const state = getDefaultProductVariantState("SHOE", 120, 99);

    expect(state.hasVariants).toBe(true);
    expect(state.options).toEqual([
      {
        name: "US",
        values: [
          "US4",
          "US4.5",
          "US5",
          "US5.5",
          "US6",
          "US6.5",
          "US7",
          "US7.5",
          "US8",
          "US8.5",
          "US9",
          "US9.5",
          "US10",
          "US10.5",
          "US11",
          "US11.5",
          "US12",
        ],
      },
    ]);
    expect(state.variants).toHaveLength(17);
    expect(state.variants[0]).toMatchObject({
      sku: "SHOE-us4",
      quantity: 99,
      optionValues: { US: "US4" },
    });
    expect(state.variants.at(-1)).toMatchObject({
      sku: "SHOE-us12",
      optionValues: { US: "US12" },
    });
  });
});

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
