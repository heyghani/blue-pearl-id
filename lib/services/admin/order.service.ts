import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { sendShippingConfirmationEmail } from "@/lib/services/email.service";

const shippableStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
];

export async function listAdminOrders({
  status,
  search,
  page = 1,
  limit = 20,
}: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search?.trim()) {
    where.OR = [
      { orderNumber: { contains: search.trim(), mode: "insensitive" } },
      { guestEmail: { contains: search.trim(), mode: "insensitive" } },
      { user: { email: { contains: search.trim(), mode: "insensitive" } } },
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true, phone: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        include: { refunds: true },
      },
    },
  });
}

export async function updateOrderStatus({
  orderId,
  status,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true } },
      items: true,
    },
  });

  if (!order) {
    return { error: "Order not found." };
  }

  if (status === OrderStatus.SHIPPED && !trackingNumber?.trim()) {
    return { error: "Tracking number is required when marking as shipped." };
  }

  if (
    status === OrderStatus.SHIPPED &&
    !shippableStatuses.includes(order.status) &&
    order.status !== OrderStatus.SHIPPED
  ) {
    return { error: "Only paid or processing orders can be shipped." };
  }

  const data: Prisma.OrderUpdateInput = { status };

  if (status === OrderStatus.SHIPPED) {
    data.trackingNumber = trackingNumber?.trim();
    data.carrier = carrier?.trim() || null;
    data.shippedAt = new Date();
  }

  if (status === OrderStatus.DELIVERED) {
    data.deliveredAt = new Date();
  }

  if (status === OrderStatus.CANCELLED) {
    data.cancelledAt = new Date();
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data,
  });

  if (
    status === OrderStatus.SHIPPED &&
    trackingNumber?.trim() &&
    order.status !== OrderStatus.SHIPPED
  ) {
    const email = order.guestEmail ?? order.user?.email;
    if (email) {
      void sendShippingConfirmationEmail({
        email,
        orderNumber: order.orderNumber,
        trackingNumber: trackingNumber.trim(),
        carrier: carrier?.trim(),
        items: order.items,
      });
    }
  }

  return { order: updated };
}
