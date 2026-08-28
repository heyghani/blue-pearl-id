"use client";

import { usePathname } from "next/navigation";

import { Price } from "@/components/shared/price";
import { Separator } from "@/components/ui/separator";
import { useCheckoutPaymentMethod } from "@/components/checkout/checkout-payment-context";
import { useTranslations } from "@/components/i18n/locale-provider";
import { PAYPAL_PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { calculatePlatformFee } from "@/lib/payments/platform-fee";

type CheckoutSummaryTotalsProps = {
  subtotal: string;
  shipping: string;
  discount: string;
};

export function CheckoutSummaryTotals({
  subtotal,
  shipping,
  discount,
}: CheckoutSummaryTotalsProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const paymentContext = useCheckoutPaymentMethod();
  const showPaymentFee = pathname.endsWith("/checkout/payment");
  const paymentMethod = showPaymentFee ? paymentContext?.paymentMethod : null;

  const subtotalAmount = Number(subtotal);
  const shippingAmount = Number(shipping);
  const discountAmount = Number(discount);
  const baseAmount = Math.max(0, subtotalAmount + shippingAmount - discountAmount);
  const platformFee = showPaymentFee
    ? calculatePlatformFee(baseAmount, paymentMethod)
    : 0;
  const total = (baseAmount + platformFee).toFixed(2);

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
        {platformFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t.checkout.platformFee.replace(
                "{percent}",
                PAYPAL_PLATFORM_FEE_PERCENT.toString(),
              )}
            </span>
            <Price amount={platformFee.toFixed(2)} />
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-medium">
        <span>{t.checkout.total}</span>
        <Price amount={total} />
      </div>
    </>
  );
}
