import { describe, expect, it } from "vitest";

import { productFormSchema } from "@/lib/validations/admin";

function baseProduct(overrides: Record<string, unknown> = {}) {
  return {
    name: "Test Shoe",
    slug: "test-shoe",
    sku: "TEST-SHOE",
    price: 120,
    quantity: 0,
    isActive: true,
    isFeatured: false,
    hasVariants: true,
    ...overrides,
  };
}

function variantPayload(variants: unknown[], options = [{ name: "Color", values: ["Red", "Blue"] }]) {
  return JSON.stringify({
    hasVariants: true,
    options,
    variants,
  });
}

describe("productFormSchema variant payload", () => {
  it("accepts generated variants with null imageUrl", () => {
    const result = productFormSchema.safeParse(
      baseProduct({
        variantsPayload: variantPayload([
          {
            sku: "TEST-SHOE-red",
            price: 120,
            compareAtPrice: null,
            quantity: 0,
            imageUrl: null,
            isActive: true,
            optionValues: { Color: "Red" },
          },
          {
            sku: "TEST-SHOE-blue",
            price: 120,
            compareAtPrice: null,
            quantity: 99,
            imageUrl: null,
            isActive: true,
            optionValues: { Color: "Blue" },
          },
        ]),
      }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects hasVariants without generated combinations", () => {
    const result = productFormSchema.safeParse(
      baseProduct({
        variantsPayload: variantPayload([]),
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors.variantsPayload?.[0]).toBe(
      "Generate at least one variant combination.",
    );
  });

  it("accepts empty imageUrl string and missing imageUrl", () => {
    const withEmpty = productFormSchema.safeParse(
      baseProduct({
        variantsPayload: variantPayload([
          {
            sku: "TEST-SHOE-red",
            price: 120,
            quantity: 0,
            imageUrl: "",
            optionValues: { Color: "Red" },
          },
        ]),
      }),
    );
    const withMissing = productFormSchema.safeParse(
      baseProduct({
        variantsPayload: variantPayload([
          {
            sku: "TEST-SHOE-red",
            price: 120,
            quantity: 0,
            optionValues: { Color: "Red" },
          },
        ]),
      }),
    );

    expect(withEmpty.success).toBe(true);
    expect(withMissing.success).toBe(true);
  });
});
