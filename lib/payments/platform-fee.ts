import { PAYPAL_PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { isPayPalMethod } from "@/lib/payments/default-method";

export function checkoutBaseAmount(
  subtotal: number,
  shipping: number,
  discount: number,
) {
  return Math.max(0, subtotal + shipping - discount);
}

export function calculatePlatformFee(
  baseAmount: number,
  paymentMethod?: string | null,
  feePercent = PAYPAL_PLATFORM_FEE_PERCENT,
): number {
  if (!isPayPalMethod(paymentMethod)) return 0;
  if (feePercent <= 0) return 0;
  if (baseAmount <= 0) return 0;

  const fee = (baseAmount * feePercent) / 100;
  return Math.round(fee * 100) / 100;
}

export function applyPlatformFeeToTotals(
  subtotal: number,
  shipping: number,
  discount: number,
  paymentMethod?: string | null,
  feePercent = PAYPAL_PLATFORM_FEE_PERCENT,
) {
  const baseAmount = checkoutBaseAmount(subtotal, shipping, discount);
  const platformFee = calculatePlatformFee(baseAmount, paymentMethod, feePercent);
  const total = Math.max(0, baseAmount + platformFee);

  return {
    baseAmount,
    platformFee,
    total,
  };
}

export function impliedPlatformFeePercent(fee: number, baseAmount: number) {
  if (baseAmount <= 0 || fee <= 0) return 0;
  return Math.round((fee / baseAmount) * 10000) / 100;
}

export function platformFeeCopy(
  templates: {
    platformFee: string;
    platformFeeCalc: string;
    platformFeeLine?: string;
  },
  percent: number,
  baseFormatted: string,
) {
  const percentText = String(percent);
  return {
    label:
      templates.platformFeeLine ??
      templates.platformFee.replace("{percent}", percentText),
    calculation: templates.platformFeeCalc
      .replace("{percent}", percentText)
      .replace("{base}", baseFormatted),
  };
}

function toAmount(value: { toString(): string } | number | string | null | undefined) {
  return Number(value ?? 0);
}

export function orderPlatformFeeDisplay(
  order: {
    subtotal: { toString(): string } | number | string;
    shippingAmount: { toString(): string } | number | string;
    discountAmount?: { toString(): string } | number | string | null;
    platformFeeAmount: { toString(): string } | number | string;
  },
  templates: {
    platformFee: string;
    platformFeeCalc: string;
    platformFeeLine?: string;
  },
  formatBase: (amount: number) => string,
) {
  const fee = toAmount(order.platformFeeAmount);
  if (fee <= 0) return null;

  const baseAmount = checkoutBaseAmount(
    toAmount(order.subtotal),
    toAmount(order.shippingAmount),
    toAmount(order.discountAmount),
  );
  const percent = impliedPlatformFeePercent(fee, baseAmount);

  return {
    ...platformFeeCopy(templates, percent, formatBase(baseAmount)),
    amount: fee.toFixed(2),
  };
}
