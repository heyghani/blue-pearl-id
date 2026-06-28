import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentStatus } from "@prisma/client";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { RefundForm } from "@/components/admin/refund-form";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import { getAdminOrder } from "@/lib/services/admin/order.service";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shippingAddress as {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  const capturedPayment = order.payments.find(
    (payment) => payment.status === PaymentStatus.CAPTURED,
  );

  const refundedTotal = capturedPayment?.refunds.reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  ) ?? 0;

  const refundableAmount = capturedPayment
    ? Math.max(0, Number(capturedPayment.amount) - refundedTotal)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="link" className="h-auto p-0 text-muted-foreground" asChild>
            <Link href="/admin/orders">← Orders</Link>
          </Button>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed {order.createdAt.toLocaleString()} ·{" "}
            {order.user?.email ?? order.guestEmail ?? "Guest"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border p-4">
            <h2 className="font-medium">Items</h2>
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
                <span className="text-muted-foreground">Shipping ({order.shippingMethodName})</span>
                <Price amount={order.shippingAmount.toString()} />
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <Price amount={order.total.toString()} />
              </div>
            </div>
            <DutiesNotice className="mt-4" />
          </section>

          <section className="rounded-lg border p-4">
            <h2 className="font-medium">Shipping address</h2>
            <address className="mt-3 not-italic text-sm text-muted-foreground">
              {shippingAddress.firstName} {shippingAddress.lastName}
              <br />
              {shippingAddress.address1}
              {shippingAddress.address2 ? (
                <>
                  <br />
                  {shippingAddress.address2}
                </>
              ) : null}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              <br />
              {shippingAddress.country}
              {shippingAddress.phone ? (
                <>
                  <br />
                  {shippingAddress.phone}
                </>
              ) : null}
            </address>
            {order.trackingNumber ? (
              <p className="mt-4 text-sm">
                <strong>Tracking:</strong> {order.trackingNumber}
                {order.carrier ? ` (${order.carrier})` : ""}
              </p>
            ) : null}
          </section>

          {order.orderReferencePhotoUrl || order.orderDimensions || order.notes ? (
            <section className="rounded-lg border p-4">
              <h2 className="font-medium">Order details</h2>
              <div className="mt-3 space-y-3 text-sm">
                {order.orderReferencePhotoUrl ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Reference photo</p>
                    <a
                      href={order.orderReferencePhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block overflow-hidden rounded-md border"
                    >
                      <img
                        src={order.orderReferencePhotoUrl}
                        alt="Order reference"
                        className="h-32 w-32 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </div>
                ) : null}
                {order.orderDimensions ? (
                  <p>
                    <span className="text-muted-foreground">Dimensions: </span>
                    {order.orderDimensions}
                  </p>
                ) : null}
                {order.notes ? (
                  <p>
                    <span className="text-muted-foreground">Notes: </span>
                    {order.notes}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border p-4">
            <h2 className="font-medium">Payments</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {order.payments.map((payment) => (
                <li key={payment.id} className="flex justify-between gap-4">
                  <span className="capitalize text-muted-foreground">
                    {payment.provider.toLowerCase()} · {payment.method.toLowerCase().replace(/_/g, " ")}
                  </span>
                  <span>
                    {payment.status.toLowerCase()} · <Price amount={payment.amount.toString()} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            trackingNumber={order.trackingNumber}
            carrier={order.carrier}
          />

          {capturedPayment && refundableAmount > 0 && (
            <RefundForm
              paymentId={capturedPayment.id}
              maxAmount={refundableAmount.toFixed(2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
