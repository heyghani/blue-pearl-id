import { PaymentMethod } from "@prisma/client";

import { PAYPAL_PLATFORM_FEE_PERCENT } from "@/lib/constants";

export function calculatePlatformFee(
  baseAmount: number,
  paymentMethod?: PaymentMethod | null,
): number {
  if (paymentMethod !== PaymentMethod.PAYPAL) return 0;
  if (PAYPAL_PLATFORM_FEE_PERCENT <= 0) return 0;
  if (baseAmount <= 0) return 0;

  const fee = (baseAmount * PAYPAL_PLATFORM_FEE_PERCENT) / 100;
  return Math.round(fee * 100) / 100;
}

export function applyPlatformFeeToTotals(
  subtotal: number,
  shipping: number,
  discount: number,
  paymentMethod?: PaymentMethod | null,
) {
  const baseAmount = Math.max(0, subtotal + shipping - discount);
  const platformFee = calculatePlatformFee(baseAmount, paymentMethod);
  const total = Math.max(0, baseAmount + platformFee);

  return {
    baseAmount,
    platformFee,
    total,
  };
}
