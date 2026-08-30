import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { ShippingForm } from "@/components/checkout/shipping-form";
import { getCheckoutDraft } from "@/lib/checkout/draft";
import { requireCheckoutCart } from "@/lib/checkout/guard";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";
import {
  priceForShippingMethod,
  toQuantityTierPrices,
} from "@/lib/shipping/quantity-tiers";

export const metadata: Metadata = {
  title: "Checkout — Shipping",
};

export default async function CheckoutShippingPage() {
  const cart = await requireCheckoutCart();
  const [draft, locale] = await Promise.all([getCheckoutDraft(), getLocale()]);
  const t = getDictionary(locale);

  if (!draft.email) {
    redirect("/checkout/information");
  }

  const [rates, quantityTiers] = await Promise.all([
    prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.shippingQuantityTier.findMany({
      where: { isActive: true },
    }),
  ]);

  const cartQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const tierPrices = quantityTiers.map(toQuantityTierPrices);

  return (
    <div>
      <CheckoutSteps current="shipping" />
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t.checkout.shippingTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.checkout.shippingLead}</p>
      <div className="mt-8">
        <ShippingForm
          defaultAddress={{
            ...draft.shippingAddress,
            phone: draft.shippingAddress?.phone ?? draft.phone,
          }}
          defaultMethod={draft.shippingMethod}
          rates={rates.map((rate) => ({
            method: rate.method,
            name: rate.name,
            price: priceForShippingMethod(
              rate.method,
              cartQuantity,
              Number(rate.price),
              tierPrices,
            ).toFixed(2),
            estimatedDaysMin: rate.estimatedDaysMin,
            estimatedDaysMax: rate.estimatedDaysMax,
          }))}
        />
      </div>
    </div>
  );
}
