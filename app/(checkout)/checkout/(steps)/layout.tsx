import { CheckoutSummary } from "@/components/checkout/checkout-summary";

export default function CheckoutStepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>{children}</div>
        <aside className="lg:sticky lg:top-8">
          <CheckoutSummary showTotals />
        </aside>
      </div>
    </main>
  );
}
