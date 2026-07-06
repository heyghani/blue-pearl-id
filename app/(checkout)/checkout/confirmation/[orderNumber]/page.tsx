import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { MetaPixelPurchase } from "@/components/analytics/meta-pixel-purchase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import { getOrderByNumber } from "@/lib/services/order.service";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const session = await getSession();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const email = order.guestEmail ?? session?.user?.email;

  return (
    <div className="min-h-screen bg-muted/20">
      {order.status === "PAID" ? (
        <MetaPixelPurchase
          orderNumber={order.orderNumber}
          value={Number(order.total)}
          currency={order.currency}
          contentIds={order.items.map((item) => item.productId)}
        />
      ) : null}
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            {order.status === "PAID" ? t.checkout.thankYouPaid : t.checkout.orderReceived}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Order <strong>{order.orderNumber}</strong>
            {email ? (
              <>
                {" "}
                — {t.checkout.confirmationSent} <strong>{email}</strong>
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-10 rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.checkout.status}</span>
            <span className="text-sm font-medium capitalize">
              {order.status.toLowerCase().replace(/_/g, " ")}
            </span>
          </div>

          <Separator className="my-4" />

          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <Price amount={item.totalPrice.toString()} />
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.checkout.subtotal}</span>
              <Price amount={order.subtotal.toString()} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.checkout.shippingLabel}</span>
              <Price amount={order.shippingAmount.toString()} />
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{t.checkout.discount}</span>
                <span>-<Price amount={order.discountAmount.toString()} /></span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-medium">
            <span>{t.checkout.total}</span>
            <Price amount={order.total.toString()} />
          </div>

          <DutiesNotice className="mt-4" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {session?.user ? (
            <Button asChild>
              <Link href="/account/orders">{t.checkout.viewOrderHistory}</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/register">{t.checkout.createAccount}</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/products">{t.checkout.continueShopping}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
