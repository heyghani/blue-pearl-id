import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PaymentRetry } from "@/components/checkout/payment-retry";
import { getOrderByNumber } from "@/lib/services/order.service";
import { PaymentMethod } from "@prisma/client";

export const metadata: Metadata = {
  title: "Payment failed",
};

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    redirect("/cart");
  }

  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    redirect("/cart");
  }

  if (order.status === "PAID") {
    redirect(`/checkout/confirmation/${orderNumber}`);
  }

  const payment = order.payments[0];
  const defaultMethod =
    payment?.method === PaymentMethod.PAYPAL ? "PAYPAL" : "CREDIT_CARD";

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-16">
      <div className="mx-auto max-w-lg">
        <PaymentRetry orderNumber={orderNumber} defaultMethod={defaultMethod} />
      </div>
    </div>
  );
}
