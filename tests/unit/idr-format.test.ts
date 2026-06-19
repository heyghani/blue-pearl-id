import { describe, expect, it } from "vitest";

import { formatIdr, formatUsdToIdrRate } from "@/lib/payments/usd-idr";

describe("IDR formatting", () => {
  it("formats IDR amounts", () => {
    expect(formatIdr(1_600_000)).toMatch(/1[.,\s]?600[.,\s]?000/);
  });

  it("formats exchange rate", () => {
    expect(formatUsdToIdrRate(16500.4)).toMatch(/16[.,\s]?500/);
  });
});
