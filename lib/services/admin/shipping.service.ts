import { ShippingMethodType } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function listShippingRates() {
  return prisma.shippingRate.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateShippingRate(
  method: ShippingMethodType,
  input: {
    price: number;
    estimatedDaysMin?: number | null;
    estimatedDaysMax?: number | null;
    isActive: boolean;
  },
) {
  return prisma.shippingRate.update({
    where: { method },
    data: {
      price: input.price,
      estimatedDaysMin: input.estimatedDaysMin ?? null,
      estimatedDaysMax: input.estimatedDaysMax ?? null,
      isActive: input.isActive,
    },
  });
}
