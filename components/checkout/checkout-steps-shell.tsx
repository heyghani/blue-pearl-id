"use client";

import type { ReactNode } from "react";

import { CheckoutPaymentProvider } from "@/components/checkout/checkout-payment-context";
import { CheckoutSummaryTotals } from "@/components/checkout/checkout-summary-totals";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import { Separator } from "@/components/ui/separator";
import type { CheckoutPaymentMethodId } from "@/lib/payments/default-method";

export type CheckoutSummarySidebarProps = {
  heading: string;
  items: ReactNode;
  totals: {
    subtotal: string;
    shipping: string;
    discount: string;
  } | null;
  feePercent: number;
  defaultPaymentMethod: CheckoutPaymentMethodId;
  taxNotice: string;
  fallbackSubtotal: string;
  labels: {
    subtotal: string;
    shippingLabel: string;
    atNextStep: string;
  };
};

export function CheckoutStepsShell({
  children,
  summary,
}: {
  children: ReactNode;
  summary: CheckoutSummarySidebarProps | null;
}) {
  return (
    <CheckoutPaymentProvider>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>{children}</div>
          <aside className="lg:sticky lg:top-8">
            {summary ? <CheckoutSummarySidebar {...summary} /> : null}
          </aside>
        </div>
      </main>
    </CheckoutPaymentProvider>
  );
}

function CheckoutSummarySidebar({
  heading,
  items,
  totals,
  feePercent,
  defaultPaymentMethod,
  taxNotice,
  fallbackSubtotal,
  labels,
}: CheckoutSummarySidebarProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        {heading}
      </h2>
      {items}
      <Separator className="my-4" />
      {totals ? (
        <CheckoutSummaryTotals
          subtotal={totals.subtotal}
          shipping={totals.shipping}
          discount={totals.discount}
          feePercent={feePercent}
          defaultPaymentMethod={defaultPaymentMethod}
        />
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{labels.subtotal}</span>
            <Price amount={fallbackSubtotal} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{labels.shippingLabel}</span>
            <span className="text-muted-foreground">{labels.atNextStep}</span>
          </div>
        </div>
      )}
      <DutiesNotice message={taxNotice} className="mt-4" />
    </div>
  );
}
