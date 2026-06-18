import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Price } from "@/components/shared/price";
import { getCustomer } from "@/lib/services/admin/customer.service";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="link" className="h-auto p-0 text-muted-foreground" asChild>
          <Link href="/admin/customers">← Customers</Link>
        </Button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {customer.name ?? customer.email}
        </h1>
        <p className="text-muted-foreground">
          {customer.email}
          {customer.phone ? ` · ${customer.phone}` : ""}
        </p>
        <p className="text-sm text-muted-foreground">
          Joined {customer.createdAt.toLocaleDateString()}
        </p>
      </div>

      <section className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">Orders</h2>
        </div>
        <div className="divide-y">
          {customer.orders.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground">
                    {order.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Price amount={order.total.toString()} className="justify-end text-sm" />
                  <OrderStatusBadge status={order.status} className="mt-1" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
