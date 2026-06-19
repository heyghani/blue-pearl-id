import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/currency";

describe("formatPrice", () => {
  it("formats USD with currency suffix by default", () => {
    expect(formatPrice(289)).toBe("$289.00 USD");
  });

  it("accepts string amounts", () => {
    expect(formatPrice("159.5")).toBe("$159.50 USD");
  });
});
