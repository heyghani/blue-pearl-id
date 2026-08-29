import { CheckoutStepsShell } from "@/components/checkout/checkout-steps-shell";
import { getCheckoutSummaryPayload } from "@/components/checkout/checkout-summary";

export default async function CheckoutStepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const summary = await getCheckoutSummaryPayload();

  return (
    <CheckoutStepsShell summary={summary}>{children}</CheckoutStepsShell>
  );
}
