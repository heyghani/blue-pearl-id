import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function listCustomers({
  search,
  page = 1,
  limit = 20,
}: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const where = {
    role: UserRole.CUSTOMER,
    deletedAt: null,
    ...(search?.trim()
      ? {
          OR: [
            { email: { contains: search.trim(), mode: "insensitive" as const } },
            { name: { contains: search.trim(), mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const skip = (Math.max(1, page) - 1) * limit;

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { customers, total, page, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getCustomer(id: string) {
  return prisma.user.findFirst({
    where: { id, role: UserRole.CUSTOMER, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
    },
  });
}
