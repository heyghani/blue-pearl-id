import { NextResponse } from "next/server";

import { TAX_NOTICE } from "@/lib/constants";
import { prisma } from "@/lib/db";

export async function GET() {
  const [rates, tiers] = await Promise.all([
    prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.shippingQuantityTier.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { quantity: "asc" }],
    }),
  ]);

  return NextResponse.json({
    data: rates.map((rate) => ({
      method: rate.method,
      name: rate.name,
      price: rate.price.toString(),
      currency: rate.currency,
      estimatedDaysMin: rate.estimatedDaysMin,
      estimatedDaysMax: rate.estimatedDaysMax,
    })),
    quantityTiers: tiers.map((tier) => ({
      quantity: tier.quantity,
      standardPrice: tier.standardPrice.toString(),
      expressPrice: tier.expressPrice.toString(),
    })),
    meta: { taxNotice: TAX_NOTICE },
  });
}
