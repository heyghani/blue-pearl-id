import { prisma } from "@/lib/db";

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getUserOrder(userId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { userId, orderNumber },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}
