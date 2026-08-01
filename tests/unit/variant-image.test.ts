import { describe, expect, it } from "vitest";

import {
  getVariantLabel,
  getVariantOptions,
  resolveVariantImageUrl,
} from "@/lib/products/variants";

describe("resolveVariantImageUrl", () => {
  const white = "opt-white";
  const black = "opt-black";
  const size38 = "opt-38";
  const size40 = "opt-40";

  const optionNamesByValueId = {
    [white]: "Color",
    [black]: "Color",
    [size38]: "US",
    [size40]: "US",
  };

  const siblings = [
    {
      imageUrl: "https://cdn.example/white.jpg",
      isActive: true,
      optionValueIds: [white, size40],
    },
    {
      imageUrl: "https://cdn.example/black.jpg",
      isActive: true,
      optionValueIds: [black, size40],
    },
  ];

  it("returns the exact variant image when present", () => {
    expect(
      resolveVariantImageUrl(
        {
          imageUrl: "https://cdn.example/white-38.jpg",
          optionValueIds: [white, size38],
        },
        siblings,
        "https://cdn.example/fallback.jpg",
        optionNamesByValueId,
      ),
    ).toBe("https://cdn.example/white-38.jpg");
  });

  it("inherits the color image from a sibling size when the SKU has none", () => {
    expect(
      resolveVariantImageUrl(
        { imageUrl: null, optionValueIds: [white, size38] },
        siblings,
        "https://cdn.example/fallback.jpg",
        optionNamesByValueId,
      ),
    ).toBe("https://cdn.example/white.jpg");
  });

  it("prefers same-color sibling over same-size different-color image", () => {
    const mixedSiblings = [
      {
        imageUrl: "https://cdn.example/white-us10.jpg",
        isActive: true,
        optionValueIds: [white, size38],
      },
      {
        imageUrl: "https://cdn.example/black-us10.jpg",
        isActive: true,
        optionValueIds: [black, size40],
      },
    ];

    expect(
      resolveVariantImageUrl(
        { imageUrl: null, optionValueIds: [black, size38] },
        mixedSiblings,
        "https://cdn.example/fallback.jpg",
        optionNamesByValueId,
      ),
    ).toBe("https://cdn.example/black-us10.jpg");
  });

  it("does not inherit a size-only match when color differs", () => {
    const whiteOnlySiblings = [
      {
        imageUrl: "https://cdn.example/white-us10.jpg",
        isActive: true,
        optionValueIds: [white, size38],
      },
    ];

    expect(
      resolveVariantImageUrl(
        { imageUrl: null, optionValueIds: [black, size38] },
        whiteOnlySiblings,
        "https://cdn.example/fallback.jpg",
        optionNamesByValueId,
      ),
    ).toBe("https://cdn.example/fallback.jpg");
  });

  it("falls back to the product image when no sibling matches", () => {
    expect(
      resolveVariantImageUrl(
        { imageUrl: null, optionValueIds: ["opt-navy", size38] },
        siblings,
        "https://cdn.example/fallback.jpg",
        optionNamesByValueId,
      ),
    ).toBe("https://cdn.example/fallback.jpg");
  });
});

describe("getVariantLabel", () => {
  it("joins color and size with option names in position order", () => {
    expect(
      getVariantLabel({
        optionValues: [
          {
            optionValue: {
              value: "41",
              option: { name: "Shoe size", position: 1 },
            },
          },
          {
            optionValue: {
              value: "Black",
              option: { name: "Color", position: 0 },
            },
          },
        ],
      }),
    ).toBe("Color: Black / Shoe size: 41");
  });
});

describe("getVariantOptions", () => {
  it("returns structured name/value pairs", () => {
    expect(
      getVariantOptions({
        optionValues: [
          {
            optionValue: {
              value: "US10",
              option: { name: "US", position: 1 },
            },
          },
          {
            optionValue: {
              value: "Black",
              option: { name: "Color", position: 0 },
            },
          },
        ],
      }),
    ).toEqual([
      { name: "Color", value: "Black" },
      { name: "US", value: "US10" },
    ]);
  });
});
