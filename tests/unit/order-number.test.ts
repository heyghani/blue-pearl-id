import { describe, expect, it } from "vitest";

import { generateOrderNumber } from "@/lib/order-number";

describe("generateOrderNumber", () => {
  it("uses BP prefix and date segment", () => {
    const orderNumber = generateOrderNumber(new Date("2026-06-18T12:00:00Z"));

    expect(orderNumber).toMatch(/^BP-20260618-[A-Z0-9]{4}$/);
  });

  it("generates unique suffixes", () => {
    const first = generateOrderNumber(new Date("2026-06-18T12:00:00Z"));
    const second = generateOrderNumber(new Date("2026-06-18T12:00:00Z"));

    expect(first).not.toBe(second);
  });
});
