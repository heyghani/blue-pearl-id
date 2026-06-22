import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/currency";

describe("formatPrice", () => {
  it("formats as currency", () => {
    expect(formatPrice(289)).toBe("$289.00");
  });

  it("accepts string amounts", () => {
    expect(formatPrice("159.5")).toBe("$159.50");
  });
});
