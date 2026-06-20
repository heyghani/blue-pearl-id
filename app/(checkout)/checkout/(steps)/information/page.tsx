import type { Metadata } from "next";

import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CustomerInfoForm } from "@/components/checkout/customer-info-form";
import { getCheckoutPrefill } from "@/lib/actions/checkout";
import { requireCheckoutCart } from "@/lib/checkout/guard";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Checkout — Information",
};

export default async function CheckoutInformationPage() {
  await requireCheckoutCart();
  const [{ draft, user }, locale] = await Promise.all([
    getCheckoutPrefill(),
    getLocale(),
  ]);
  const t = getDictionary(locale);

  return (
    <div>
      <CheckoutSteps current="information" />
      <h1 className="text-2xl font-semibold tracking-tight">Contact information</h1>
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
