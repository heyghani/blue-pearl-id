import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { PaymentForm } from "@/components/checkout/payment-form";
import { getCheckoutDraft } from "@/lib/checkout/draft";
import { requireCheckoutCart } from "@/lib/checkout/guard";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Checkout — Payment",
};

export default async function CheckoutPaymentPage() {
  await requireCheckoutCart();
  const [draft, locale] = await Promise.all([getCheckoutDraft(), getLocale()]);
  const t = getDictionary(locale);

  if (!draft.email) {
    redirect("/checkout/information");
  }

  if (!draft.shippingAddress || !draft.shippingMethod) {
    redirect("/checkout/shipping");
  }

  return (
    <div>
      <CheckoutSteps current="payment" />
      <h1 className="text-2xl font-semibold tracking-tight">{t.checkout.paymentTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.checkout.paymentLead}</p>
      <div className="mt-8">
        <PaymentForm
          email={draft.email}
          defaultCoupon={draft.couponCode ?? ""}
        />
      </div>
    </div>
  );
}
