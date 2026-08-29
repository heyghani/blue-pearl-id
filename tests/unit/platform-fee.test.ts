import { describe, expect, it } from "vitest";
import { PaymentMethod } from "@prisma/client";

import {
  applyPlatformFeeToTotals,
  calculatePlatformFee,
  impliedPlatformFeePercent,
  orderPlatformFeeDisplay,
  platformFeeCopy,
} from "@/lib/payments/platform-fee";

describe("platform fee", () => {
  it("returns zero for non-PayPal methods", () => {
    expect(calculatePlatformFee(100, PaymentMethod.CREDIT_CARD)).toBe(0);
    expect(calculatePlatformFee(100, PaymentMethod.USDT)).toBe(0);
    expect(calculatePlatformFee(100, null)).toBe(0);
  });

  it("calculates PayPal fee from base amount", () => {
    expect(calculatePlatformFee(215, PaymentMethod.PAYPAL)).toBe(7.5);
  });

  it("uses a custom fee percent", () => {
    expect(calculatePlatformFee(200, PaymentMethod.PAYPAL, 5)).toBe(10);
    expect(calculatePlatformFee(200, PaymentMethod.PAYPAL, 0)).toBe(0);
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

  it("applies a custom percent to checkout totals", () => {
    expect(
      applyPlatformFeeToTotals(100, 0, 0, PaymentMethod.PAYPAL, 4),
    ).toEqual({
      baseAmount: 100,
      platformFee: 4,
      total: 104,
    });
  });

  it("derives the displayed percent from stored amounts", () => {
    expect(impliedPlatformFeePercent(7.5, 215)).toBe(3.49);
  });

  it("formats the order-summary calculation copy", () => {
    expect(
      platformFeeCopy(
        {
          platformFee: "PayPal processing fee ({percent}%)",
          platformFeeCalc: "{percent}% × {base}",
        },
        3.49,
        "$215.00",
      ),
    ).toEqual({
      label: "PayPal processing fee (3.49%)",
      calculation: "3.49% × $215.00",
    });
  });

  it("uses the short line label when provided", () => {
    expect(
      platformFeeCopy(
        {
          platformFee: "PayPal processing fee ({percent}%)",
          platformFeeCalc: "{percent}% × {base}",
          platformFeeLine: "PayPal processing fee",
        },
        3.49,
        "$215.00",
      ),
    ).toEqual({
      label: "PayPal processing fee",
      calculation: "3.49% × $215.00",
    });
  });

  it("builds fee display details from an order", () => {
    expect(
      orderPlatformFeeDisplay(
        {
          subtotal: "200.00",
          shippingAmount: "15.00",
          discountAmount: "0.00",
          platformFeeAmount: "7.50",
        },
        {
          platformFee: "PayPal processing fee ({percent}%)",
          platformFeeCalc: "{percent}% × {base}",
          platformFeeLine: "PayPal processing fee",
        },
        (amount) => `$${amount.toFixed(2)}`,
      ),
    ).toEqual({
      label: "PayPal processing fee",
      calculation: "3.49% × $215.00",
      amount: "7.50",
    });
  });
});
