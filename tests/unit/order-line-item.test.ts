import { describe, expect, it } from "vitest";

import {
  formatOrderItemOptionsLabel,
  parseOrderItemOptions,
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
