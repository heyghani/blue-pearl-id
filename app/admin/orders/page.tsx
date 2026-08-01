import Link from "next/link";
import { OrderStatus } from "@prisma/client";

import {
  AdminDataTable,
  AdminTableHead,
} from "@/components/admin/admin-data-table";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import {
  AdminFilterChip,
  AdminFilterChips,
  AdminListToolbar,
} from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PaymentStatusBadge } from "@/components/admin/payment-status-badge";
import { Price } from "@/components/shared/price";
import { adminListHref } from "@/lib/admin/list-query";
import {
  getAdminOrderStatusCounts,
  listAdminOrders,
} from "@/lib/services/admin/order.service";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value?: OrderStatus; label: string }[] = [
  { value: undefined, label: "All" },
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.PAID, label: "Paid" },
  { value: OrderStatus.PROCESSING, label: "Processing" },
  { value: OrderStatus.SHIPPED, label: "Shipped" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
  { value: OrderStatus.REFUNDED, label: "Refunded" },
  { value: OrderStatus.PAYMENT_FAILED, label: "Payment failed" },
];

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

  const query = { status, search: params.search };
  const hasFilters = Boolean(status || params.search);

  const [{ orders, total, totalPages }, counts] = await Promise.all([
    listAdminOrders({
      status,
      search: params.search,
      page,
      limit: PAGE_SIZE,
    }),
    getAdminOrderStatusCounts(params.search),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="View, fulfill, and manage customer orders."
        meta={`${total} order${total === 1 ? "" : "s"}`}
      />

      <AdminListToolbar
        searchDefault={params.search ?? ""}
        searchPlaceholder="Search by order # or email…"
        clearHref="/admin/orders"
        hasFilters={hasFilters}
        hiddenFields={{ status }}
        filters={
          <AdminFilterChips>
            {STATUS_FILTERS.map((filter) => {
              const count = filter.value
                ? (counts.byStatus[filter.value] ?? 0)
                : counts.all;
              return (
                <AdminFilterChip
                  key={filter.label}
                  href={adminListHref("/admin/orders", query, {
                    status: filter.value,
                    page: undefined,
                  })}
                  active={status === filter.value}
                  count={count}
                >
                  {filter.label}
                </AdminFilterChip>
              );
            })}
          </AdminFilterChips>
        }
      />

      <AdminDataTable
        minWidthClassName="min-w-[760px]"
        empty={
          orders.length === 0 ? (
            hasFilters ? (
              <AdminEmptyState
                title="No orders match"
                description="Try another status or clear your search."
                actionLabel="Clear filters"
                actionHref="/admin/orders"
              />
            ) : (
              <AdminEmptyState
                title="No orders yet"
                description="Orders will appear here when customers check out."
              />
            )
          ) : undefined
        }
      >
        <AdminTableHead>
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </AdminTableHead>
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
                <td className="px-4 py-3">
                  {payment ? (
                    <PaymentStatusBadge status={payment.status} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </AdminDataTable>

      <AdminPagination
        pathname="/admin/orders"
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </div>
  );
}
