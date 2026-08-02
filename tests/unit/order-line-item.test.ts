import { describe, expect, it } from "vitest";

import {
  formatOrderItemOptionsLabel,
  parseOrderItemOptions,
  resolveOrderLineImageUrl,
  splitLegacyProductName,
} from "@/lib/orders/line-item";

describe("parseOrderItemOptions", () => {
  it("reads structured optionsJson", () => {
    expect(
      parseOrderItemOptions([
        { name: "Color", value: "Black" },
        { name: "US", value: "US10" },
      ]),
    ).toEqual([
      { name: "Color", value: "Black" },
      { name: "US", value: "US10" },
    ]);
  });

  it("falls back to variantLabel", () => {
    expect(parseOrderItemOptions(null, "Color: Black / US: US10")).toEqual([
      { name: "Color", value: "Black" },
      { name: "US", value: "US10" },
    ]);
  });
});

describe("splitLegacyProductName", () => {
  it("splits mashed legacy titles", () => {
    expect(splitLegacyProductName("ASICS GEL-CUMULUS -1 — US10")).toEqual({
      title: "ASICS GEL-CUMULUS -1",
      legacyLabel: "US10",
    });
  });

  it("keeps clean product names intact", () => {
    expect(splitLegacyProductName("M Air Force 1 Low")).toEqual({
      title: "M Air Force 1 Low",
      legacyLabel: null,
    });
  });
});

describe("formatOrderItemOptionsLabel", () => {
  it("formats labeled options", () => {
    expect(
      formatOrderItemOptionsLabel([
        { name: "Color", value: "Black" },
        { name: "US", value: "US10" },
      ]),
    ).toBe("Color: Black / US: US10");
  });
});

describe("resolveOrderLineImageUrl", () => {
  it("prefers the snapshotted imageUrl", () => {
    expect(
      resolveOrderLineImageUrl({
        imageUrl: "https://cdn.example/snap.jpg",
        productSku: "SKU-1",
        product: {
          images: [{ url: "https://cdn.example/primary.jpg" }],
          variants: [
            { id: "v1", sku: "SKU-1", imageUrl: "https://cdn.example/variant.jpg" },
          ],
        },
      }),
    ).toBe("https://cdn.example/snap.jpg");
  });

  it("falls back to matching variant image for legacy rows", () => {
    expect(
      resolveOrderLineImageUrl({
        imageUrl: null,
        productSku: "BP-ASICS-GEL-CUMULUS-1-us10",
        product: {
          images: [{ url: "https://cdn.example/primary.jpg" }],
          variants: [
            {
              id: "v1",
              sku: "BP-ASICS-GEL-CUMULUS-1-us10",
              imageUrl: "https://cdn.example/us10.jpg",
            },
          ],
        },
      }),
    ).toBe("https://cdn.example/us10.jpg");
  });

  it("falls back to product primary image when variant has none", () => {
    expect(
      resolveOrderLineImageUrl({
        imageUrl: null,
        productSku: "SKU-1",
        product: {
          images: [{ url: "https://cdn.example/primary.jpg" }],
          variants: [{ id: "v1", sku: "SKU-1", imageUrl: null }],
        },
      }),
    ).toBe("https://cdn.example/primary.jpg");
  });
});
