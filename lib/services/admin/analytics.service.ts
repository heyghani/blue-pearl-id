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

  const [paidOrders, totalOrders, abandonedCount, topProducts] = await Promise.all([
    prisma.order.findMany({
      where: { ...dateFilter, status: { in: paidStatuses } },
      select: { total: true },
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
  ]);

  const revenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  const conversionRate =
    totalOrders + abandonedCount > 0
      ? totalOrders / (totalOrders + abandonedCount)
      : 0;

  const inventories = await prisma.inventory.findMany({
    where: { trackInventory: true },
    select: { quantity: true, lowStockThreshold: true },
  });
  const lowStock = inventories.filter(
    (item) => item.quantity <= item.lowStockThreshold,
  ).length;

  const pendingFulfillment = await prisma.order.count({
    where: { status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] } },
  });

  const recentOrders = await prisma.order.findMany({
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
  });

  const capturedPayments = await prisma.payment.count({
    where: { status: PaymentStatus.CAPTURED, ...dateFilter },
  });

  return {
    revenue: revenue.toFixed(2),
    orders: totalOrders,
    paidOrders: paidOrders.length,
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
