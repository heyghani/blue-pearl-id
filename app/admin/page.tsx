import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { TrafficStats } from "@/components/admin/traffic-stats";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { getAdminAnalytics } from "@/lib/services/admin/analytics.service";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();
  const needsAttention =
    analytics.pendingFulfillment > 0 || analytics.lowStock > 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Store performance, orders, and inventory at a glance."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/orders">View all orders</Link>
          </Button>
        }
      />

      {needsAttention ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <div className="text-sm">
              <p className="font-medium text-amber-950 dark:text-amber-100">
                Needs attention
              </p>
              <p className="mt-0.5 text-amber-900/80 dark:text-amber-200/80">
                {analytics.pendingFulfillment > 0
                  ? `${analytics.pendingFulfillment} order${analytics.pendingFulfillment === 1 ? "" : "s"} awaiting fulfillment`
                  : null}
                {analytics.pendingFulfillment > 0 && analytics.lowStock > 0
                  ? " · "
                  : null}
                {analytics.lowStock > 0
                  ? `${analytics.lowStock} low-stock SKU${analytics.lowStock === 1 ? "" : "s"}`
                  : null}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.pendingFulfillment > 0 ? (
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/orders?status=PAID">Fulfill orders</Link>
              </Button>
            ) : null}
            {analytics.lowStock > 0 ? (
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/products?stock=low">
                  <Package className="mr-1.5 h-3.5 w-3.5" />
                  Review stock
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard label="Revenue" value={formatPrice(analytics.revenue)} />
        <StatCard
          label="Orders"
          value={analytics.orders}
          hint={`${analytics.paidOrders} paid`}
          href="/admin/orders"
        />
        <StatCard
          label="Checkout conversion"
          value={`${(analytics.conversionRate * 100).toFixed(1)}%`}
          hint="Orders vs abandoned checkouts"
        />
        <StatCard
          label="Pending fulfillment"
          value={analytics.pendingFulfillment}
          hint="Paid & processing"
          href="/admin/orders?status=PAID"
        />
        <StatCard
          label="Low stock"
          value={analytics.lowStock}
          hint="At or below threshold"
          href="/admin/products?stock=low"
        />
      </div>

      <TrafficStats />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="flex max-h-[22rem] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h2 className="font-medium">Recent orders</h2>
            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <Link href="/admin/orders">View all</Link>
            </Button>
          </div>
          <div className="min-h-0 flex-1 divide-y overflow-y-auto">
            {analytics.recentOrders.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              analytics.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="truncate text-muted-foreground">
                      {order.user?.email ?? order.guestEmail ?? "Guest"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Price amount={order.total.toString()} className="justify-end text-sm" />
                    <OrderStatusBadge status={order.status} className="mt-1" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="flex max-h-[22rem] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h2 className="font-medium">Top products</h2>
            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <Link href="/admin/products">View catalog</Link>
            </Button>
          </div>
          <div className="min-h-0 flex-1 divide-y overflow-y-auto">
            {analytics.topProducts.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              analytics.topProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0 truncate font-medium hover:underline">
                    {product.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {product.units} sold
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
