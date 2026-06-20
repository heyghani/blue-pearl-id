import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserOrders } from "@/lib/services/account.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/shared/price";

export default async function AccountPage() {
  const session = await getSession();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, emailVerified: true },
      })
    : null;

  const recentOrders = session?.user?.id
    ? (await getUserOrders(session.user.id)).slice(0, 3)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-1 text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View order history and track shipments.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage shipping addresses for faster checkout.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/addresses">Manage addresses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentOrders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/account/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:opacity-80"
              >
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Price amount={order.total.toString()} className="justify-end text-sm" />
                  <OrderStatusBadge status={order.status} className="mt-1" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {session?.user?.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" asChild>
              <Link href="/admin">Go to admin dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
