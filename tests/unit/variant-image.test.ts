import { describe, expect, it } from "vitest";

import {
  getVariantLabel,
  resolveVariantImageUrl,
} from "@/lib/products/variants";

describe("resolveVariantImageUrl", () => {
  const white = "opt-white";
  const black = "opt-black";
  const size38 = "opt-38";
  const size40 = "opt-40";

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
      ),
    ).toBe("https://cdn.example/white-38.jpg");
  });

  it("inherits the color image from a sibling size when the SKU has none", () => {
    expect(
      resolveVariantImageUrl(
        { imageUrl: null, optionValueIds: [white, size38] },
        siblings,
        "https://cdn.example/fallback.jpg",
      ),
    ).toBe("https://cdn.example/white.jpg");
  });

  it("falls back to the product image when no sibling matches", () => {
    expect(
      resolveVariantImageUrl(
        { imageUrl: null, optionValueIds: ["opt-navy", size38] },
        siblings,
        "https://cdn.example/fallback.jpg",
      ),
    ).toBe("https://cdn.example/fallback.jpg");
  });
});

describe("getVariantLabel", () => {
  it("joins color and size in option position order", () => {
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
    ).toBe("Black / 41");
  });
});
