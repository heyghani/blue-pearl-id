import { NextResponse } from "next/server";

import { getOrderPaymentStatus } from "@/lib/services/payment.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await context.params;
  const order = await getOrderPaymentStatus(orderNumber);

  if (!order) {
    return NextResponse.json(
      { error: { message: "Order not found." } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: order });
}
