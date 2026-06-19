import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import { auth } from "@/lib/auth";
import { getUserOrder } from "@/lib/services/account.service";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export default async function AccountOrderDetailPage({ params }: Props) {
  const session = await auth();
  const { orderNumber } = await params;

  if (!session?.user?.id) {
    notFound();
  }

  const order = await getUserOrder(session.user.id, orderNumber);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shippingAddress as {
    firstName?: string;
    lastName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="link" className="h-auto p-0 text-muted-foreground" asChild>
          <Link href="/account/orders">← All orders</Link>
        </Button>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{order.orderNumber}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {order.createdAt.toLocaleDateString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {order.trackingNumber ? (
        <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
          <span className="font-medium">Tracking:</span> {order.trackingNumber}
          {order.carrier ? ` · ${order.carrier}` : ""}
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-5">
        <h3 className="font-medium">Items</h3>
        <ul className="mt-4 space-y-3">
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
            <span className="text-muted-foreground">Subtotal</span>
            <Price amount={order.subtotal.toString()} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <Price amount={order.shippingAmount.toString()} />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-medium">
          <span>Total</span>
          <Price amount={order.total.toString()} />
        </div>

        <DutiesNotice className="mt-4" />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h3 className="font-medium">Shipping address</h3>
        <address className="mt-3 not-italic text-sm text-muted-foreground">
          {shippingAddress.firstName} {shippingAddress.lastName}
          <br />
          {shippingAddress.line1}
          {shippingAddress.line2 ? (
            <>
              <br />
              {shippingAddress.line2}
            </>
          ) : null}
          <br />
          {shippingAddress.city}
          {shippingAddress.state ? `, ${shippingAddress.state}` : ""}{" "}
          {shippingAddress.postalCode}
          <br />
          {shippingAddress.country}
        </address>
      </div>

      {order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED" ? (
        <Button variant="outline" asChild>
          <Link href={`/checkout/confirmation/${order.orderNumber}`}>View confirmation</Link>
        </Button>
      ) : null}
    </div>
  );
}
