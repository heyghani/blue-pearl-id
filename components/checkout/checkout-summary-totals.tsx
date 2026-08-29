"use client";

import { PlatformFeeRow } from "@/components/shared/platform-fee-row";
import { Price } from "@/components/shared/price";
import { Separator } from "@/components/ui/separator";
import { useCheckoutPaymentMethod } from "@/components/checkout/checkout-payment-context";
import { useTranslations } from "@/components/i18n/locale-provider";
import { formatPrice } from "@/lib/currency";
import {
  calculatePlatformFee,
  checkoutBaseAmount,
  platformFeeCopy,
} from "@/lib/payments/platform-fee";

type CheckoutSummaryTotalsProps = {
  subtotal: string;
  shipping: string;
  discount: string;
  feePercent: number;
};

export function CheckoutSummaryTotals({
  subtotal,
  shipping,
  discount,
  feePercent,
}: CheckoutSummaryTotalsProps) {
  const t = useTranslations();
  const paymentContext = useCheckoutPaymentMethod();
  const paymentMethod = paymentContext?.paymentMethod ?? null;

  const subtotalAmount = Number(subtotal);
  const shippingAmount = Number(shipping);
  const discountAmount = Number(discount);
  const baseAmount = checkoutBaseAmount(
    subtotalAmount,
    shippingAmount,
    discountAmount,
  );
  const platformFee = calculatePlatformFee(
    baseAmount,
    paymentMethod,
    feePercent,
  );
  const total = (baseAmount + platformFee).toFixed(2);
  const feeCopy =
    platformFee > 0
      ? platformFeeCopy(t.checkout, feePercent, formatPrice(baseAmount))
      : null;

  return (
    <>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.checkout.subtotal}</span>
          <Price amount={subtotal} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.checkout.shippingLabel}</span>
          <Price amount={shipping} />
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>{t.checkout.discount}</span>
            <span>
              -<Price amount={discount} />
            </span>
          </div>
        )}
        {feeCopy ? (
          <PlatformFeeRow
            label={feeCopy.label}
            calculation={feeCopy.calculation}
            amount={platformFee}
          />
        ) : null}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-medium">
        <span>{t.checkout.total}</span>
        <Price amount={total} />
      </div>
    </>
  );
}
