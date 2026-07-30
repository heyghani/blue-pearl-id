import { OrderStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function getAdminAnalytics(from?: Date, to?: Date) {
  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const paidStatuses: OrderStatus[] = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  const [
    paidAggregate,
    totalOrders,
    abandonedCount,
    topProducts,
    lowStockRows,
    pendingFulfillment,
    recentOrders,
    capturedPayments,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { ...dateFilter, status: { in: paidStatuses } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: dateFilter }),
    prisma.abandonedCheckout.count({
      where: {
        ...dateFilter,
        orderId: null,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: {
        order: {
          ...dateFilter,
          status: { in: paidStatuses },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM inventory
      WHERE "trackInventory" = true
        AND quantity <= "lowStockThreshold"
    `,
    prisma.order.count({
      where: { status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] } },
    }),
    prisma.order.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        guestEmail: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
    prisma.payment.count({
      where: { status: PaymentStatus.CAPTURED, ...dateFilter },
    }),
  ]);

  const revenue = Number(paidAggregate._sum.total ?? 0);
  const paidOrders = paidAggregate._count;
  const lowStock = Number(lowStockRows[0]?.count ?? 0);

  const conversionRate =
    totalOrders + abandonedCount > 0
      ? totalOrders / (totalOrders + abandonedCount)
      : 0;

  return {
    revenue: revenue.toFixed(2),
    orders: totalOrders,
    paidOrders,
    capturedPayments,
    conversionRate,
    pendingFulfillment,
    lowStock,
    topProducts: topProducts.map((item) => ({
      name: item.productName,
      units: item._sum.quantity ?? 0,
    })),
    recentOrders,
  };
}
