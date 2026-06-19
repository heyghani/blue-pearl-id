import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { auth } from "@/lib/auth";
import { getUserOrders } from "@/lib/services/account.service";

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = session?.user?.id
    ? await getUserOrders(session.user.id)
    : [];

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
        <h2 className="text-xl font-semibold tracking-tight">No orders yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          When you place an order while signed in, it will appear here with tracking and status updates.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Order history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="divide-y rounded-lg border bg-card">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.orderNumber}`}
            className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" · "}
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </p>
              {order.trackingNumber ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tracking: {order.trackingNumber}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <Price amount={order.total.toString()} className="text-base" />
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
