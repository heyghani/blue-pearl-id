import { describe, expect, it } from "vitest";

import {
  resolveDisplayStockStatus,
  type SerializedProductVariant,
} from "@/lib/products/variants";

function makeVariant(
  overrides: Partial<SerializedProductVariant> = {},
): SerializedProductVariant {
  return {
    id: "variant-1",
    sku: "SKU-1",
    price: null,
    compareAtPrice: null,
    imageUrl: null,
    quantity: 1,
    isActive: true,
    optionValueIds: ["ov-1"],
    ...overrides,
  };
}

describe("resolveDisplayStockStatus", () => {
  it("uses product stock before a variant is selected", () => {
    expect(
      resolveDisplayStockStatus({
        hasVariants: true,
        productInStock: true,
        selectedVariant: null,
      }),
    ).toEqual({ inStock: true, source: "product" });

    expect(
      resolveDisplayStockStatus({
        hasVariants: true,
        productInStock: false,
        selectedVariant: null,
      }),
    ).toEqual({ inStock: false, source: "product" });
  });

  it("uses selected variant stock when product is in stock but variant is sold out", () => {
    expect(
      resolveDisplayStockStatus({
        hasVariants: true,
        productInStock: true,
        selectedVariant: makeVariant({ quantity: 0 }),
      }),
    ).toEqual({ inStock: false, source: "variant" });
  });

  it("uses selected variant stock when product looks sold out but variant is available", () => {
    expect(
      resolveDisplayStockStatus({
        hasVariants: true,
        productInStock: false,
        selectedVariant: makeVariant({ quantity: 3 }),
      }),
    ).toEqual({ inStock: true, source: "variant" });
  });

  it("treats inactive selected variants as out of stock", () => {
    expect(
      resolveDisplayStockStatus({
        hasVariants: true,
        productInStock: true,
        selectedVariant: makeVariant({ quantity: 5, isActive: false }),
      }),
    ).toEqual({ inStock: false, source: "variant" });
  });

  it("uses product stock for simple products without variants", () => {
    expect(
      resolveDisplayStockStatus({
        hasVariants: false,
        productInStock: true,
        selectedVariant: null,
      }),
    ).toEqual({ inStock: true, source: "product" });
  });
});
