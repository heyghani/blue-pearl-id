import Link from "next/link";
import { OrderStatus } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { listAdminOrders } from "@/lib/services/admin/order.service";
import { Input } from "@/components/ui/input";
import { Price } from "@/components/shared/price";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = Object.values(OrderStatus).includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;

  const { orders, totalPages } = await listAdminOrders({
    status,
    search: params.search,
    page,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="View, fulfill, and manage customer orders."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <form className="max-w-md flex-1">
          <Input
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Search by order # or email…"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`rounded-full border px-3 py-1 text-sm ${!status ? "bg-primary text-primary-foreground" : ""}`}
          >
            All
          </Link>
          {[OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED].map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`rounded-full border px-3 py-1 text-sm capitalize ${status === s ? "bg-primary text-primary-foreground" : ""}`}
            >
              {s.toLowerCase().replace(/_/g, " ")}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => {
              const payment = order.payments[0];
              return (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.user?.email ?? order.guestEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3">{order._count.items}</td>
                  <td className="px-4 py-3">
                    <Price amount={order.total.toString()} />
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {payment?.status.toLowerCase() ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${status ? `&status=${status}` : ""}${params.search ? `&search=${params.search}` : ""}`}
              className={`rounded px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : "border"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
