import { NextResponse } from "next/server";

import { TAX_NOTICE } from "@/lib/constants";
import { prisma } from "@/lib/db";

export async function GET() {
  const rates = await prisma.shippingRate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    data: rates.map((rate) => ({
      method: rate.method,
      name: rate.name,
      price: rate.price.toString(),
      currency: rate.currency,
      estimatedDaysMin: rate.estimatedDaysMin,
      estimatedDaysMax: rate.estimatedDaysMax,
    })),
    meta: { taxNotice: TAX_NOTICE },
  });
}
