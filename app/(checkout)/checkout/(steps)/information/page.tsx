import type { Metadata } from "next";

import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CustomerInfoForm } from "@/components/checkout/customer-info-form";
import { getCheckoutPrefill } from "@/lib/actions/checkout";
import { requireCheckoutCart } from "@/lib/checkout/guard";

export const metadata: Metadata = {
  title: "Checkout — Information",
};

export default async function CheckoutInformationPage() {
  await requireCheckoutCart();
  const { draft, user } = await getCheckoutPrefill();

  return (
    <div>
      <CheckoutSteps current="information" />
      <h1 className="text-2xl font-semibold tracking-tight">Contact information</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Guest checkout is available. We&apos;ll email your order confirmation.
      </p>
      <div className="mt-8">
        <CustomerInfoForm
          defaultEmail={draft.email ?? user?.email ?? ""}
          defaultPhone={draft.phone ?? user?.phone ?? ""}
        />
      </div>
    </div>
  );
}
