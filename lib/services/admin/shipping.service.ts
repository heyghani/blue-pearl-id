import { ShippingMethodType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { DEFAULT_QUANTITY_PACKS } from "@/lib/shipping/quantity-tiers";

export async function listShippingRates() {
  return prisma.shippingRate.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function listShippingQuantityTiers() {
  return prisma.shippingQuantityTier.findMany({
    orderBy: [{ sortOrder: "asc" }, { quantity: "asc" }],
  });
}

export async function listActiveShippingQuantityTiers() {
  return prisma.shippingQuantityTier.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { quantity: "asc" }],
  });
}

export async function listActiveQuantityPacks(): Promise<number[]> {
  const tiers = await listActiveShippingQuantityTiers();
  return tiers.map((tier) => tier.quantity);
}

export async function getStorefrontShippingRates() {
  const [tiers, standardRate, expressRate] = await Promise.all([
    listActiveShippingQuantityTiers(),
    prisma.shippingRate.findFirst({
      where: { method: ShippingMethodType.STANDARD, isActive: true },
    }),
    prisma.shippingRate.findFirst({
      where: { method: ShippingMethodType.EXPRESS, isActive: true },
    }),
  ]);

  return {
    tiers: tiers.map((tier) => ({
      quantity: tier.quantity,
      standardPrice: tier.standardPrice.toString(),
      expressPrice: tier.expressPrice.toString(),
    })),
    standardFallback: standardRate?.price.toString() ?? "15.00",
    expressFallback: expressRate?.price.toString() ?? "35.00",
  };
}

export async function createShippingQuantityTier(input: {
  quantity: number;
  standardPrice: number;
  expressPrice: number;
  isActive: boolean;
}) {
  const maxSort = await prisma.shippingQuantityTier.aggregate({
    _max: { sortOrder: true },
  });

  return prisma.shippingQuantityTier.create({
    data: {
      quantity: input.quantity,
      standardPrice: input.standardPrice,
      expressPrice: input.expressPrice,
      isActive: input.isActive,
      sortOrder: (maxSort._max.sortOrder ?? DEFAULT_QUANTITY_PACKS.length - 1) + 1,
    },
  });
}

export async function updateShippingQuantityTier(
  id: string,
  input: {
    quantity: number;
    standardPrice: number;
    expressPrice: number;
    isActive: boolean;
  },
) {
  return prisma.shippingQuantityTier.update({
    where: { id },
    data: {
      quantity: input.quantity,
      standardPrice: input.standardPrice,
      expressPrice: input.expressPrice,
      isActive: input.isActive,
    },
  });
}

export async function deleteShippingQuantityTier(id: string) {
  return prisma.shippingQuantityTier.delete({
    where: { id },
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
