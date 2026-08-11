import type { Metadata } from "next";

import { MetaPixelFunnelEvent } from "@/components/analytics/meta-pixel-funnel-event";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CustomerInfoForm } from "@/components/checkout/customer-info-form";
import { getCheckoutPrefill } from "@/lib/actions/checkout";
import { sendMetaInitiateCheckoutCapi } from "@/lib/analytics/meta-capi";
import { requireCheckoutCart } from "@/lib/checkout/guard";
import { CURRENCY } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { getCart } from "@/lib/services/cart.service";

export const metadata: Metadata = {
  title: "Checkout — Information",
};

export default async function CheckoutInformationPage() {
  await requireCheckoutCart();
  const [{ draft, user }, locale, cart] = await Promise.all([
    getCheckoutPrefill(),
    getLocale(),
    getCart(),
  ]);
  const t = getDictionary(locale);

  const contentIds = cart.items.map((item) => item.productId);
  const eventId = cart.id ? `ic_${cart.id}` : `ic_${Date.now()}`;
  const value = Number(cart.subtotal);
  const email = draft.email ?? user?.email ?? null;
  const phone = draft.phone ?? user?.phone ?? null;

  // Server CAPI + browser Pixel share event_id for dedup (Purchase pattern).
  void sendMetaInitiateCheckoutCapi({
    eventId,
    value,
    currency: CURRENCY,
    contentIds,
    numItems: cart.itemCount,
    email,
    phone,
  }).catch((error) => {
    console.error("[Meta CAPI] InitiateCheckout send failed:", error);
  });

  return (
    <div>
      <MetaPixelFunnelEvent
        eventName="InitiateCheckout"
        eventId={eventId}
        value={value}
        currency={CURRENCY}
        contentIds={contentIds}
        numItems={cart.itemCount}
        sendCapi={false}
      />
      <CheckoutSteps current="information" />
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t.checkout.contactTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.checkout.informationLead}</p>
      <div className="mt-8">
        <CustomerInfoForm
          defaultEmail={draft.email ?? user?.email ?? ""}
          defaultPhone={draft.phone ?? user?.phone ?? ""}
        />
      </div>
    </div>
  );
}
