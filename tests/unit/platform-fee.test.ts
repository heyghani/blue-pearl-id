import { describe, expect, it } from "vitest";
import { PaymentMethod } from "@prisma/client";

import { applyPlatformFeeToTotals, calculatePlatformFee } from "@/lib/payments/platform-fee";

describe("platform fee", () => {
  it("returns zero for non-PayPal methods", () => {
    expect(calculatePlatformFee(100, PaymentMethod.CREDIT_CARD)).toBe(0);
    expect(calculatePlatformFee(100, PaymentMethod.USDT)).toBe(0);
    expect(calculatePlatformFee(100, null)).toBe(0);
  });

  it("calculates PayPal fee from base amount", () => {
    expect(calculatePlatformFee(215, PaymentMethod.PAYPAL)).toBe(7.5);
  });

  it("adds PayPal fee to checkout totals", () => {
    expect(
      applyPlatformFeeToTotals(200, 15, 0, PaymentMethod.PAYPAL),
    ).toEqual({
      baseAmount: 215,
      platformFee: 7.5,
      total: 222.5,
    });
  });
});
