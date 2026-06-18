import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PaymentCheckout } from "@/components/checkout/payment-checkout";
import { Price } from "@/components/shared/price";
import { getOrderByNumber } from "@/lib/services/order.service";

export const metadata: Metadata = {
  title: "Complete payment",
};

export default async function CheckoutProcessingPage({
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

  if (["PAYMENT_FAILED", "EXPIRED", "CANCELLED"].includes(order.status)) {
    redirect(`/payment/failed?order=${orderNumber}`);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Complete your payment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <strong>{order.orderNumber}</strong>
        </p>
        <Price
          amount={order.total.toString()}
          className="mt-4 justify-center text-2xl"
        />
      </div>

      <PaymentCheckout orderNumber={orderNumber} />
    </main>
  );
}
