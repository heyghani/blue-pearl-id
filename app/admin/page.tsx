import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Price } from "@/components/shared/price";
import { formatPrice } from "@/lib/currency";
import { getAdminAnalytics } from "@/lib/services/admin/analytics.service";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Store overview and recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(analytics.revenue)} />
        <StatCard label="Orders" value={analytics.orders} hint={`${analytics.paidOrders} paid`} />
        <StatCard
          label="Checkout conversion"
          value={`${(analytics.conversionRate * 100).toFixed(1)}%`}
          hint="Orders vs abandoned checkouts"
        />
        <StatCard
          label="Pending fulfillment"
          value={analytics.pendingFulfillment}
          hint={`${analytics.lowStock} low-stock SKUs`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Recent orders</h2>
          </div>
          <div className="divide-y">
            {analytics.recentOrders.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              analytics.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-muted-foreground">
                      {order.user?.email ?? order.guestEmail ?? "Guest"}
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

        <section className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Top products</h2>
          </div>
          <div className="divide-y">
            {analytics.topProducts.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              analytics.topProducts.map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">{product.units} sold</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
