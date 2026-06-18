import { NextResponse } from "next/server";

import { getOrderByNumber } from "@/lib/services/order.service";
import { initiatePayment } from "@/lib/services/payment.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order");

  if (!orderNumber) {
    return NextResponse.json(
      { error: { message: "Order number is required." } },
      { status: 400 },
    );
  }

  const order = await getOrderByNumber(orderNumber);
  const payment = order?.payments[0];

  if (!order || !payment) {
    return NextResponse.json(
      { error: { message: "Order not found." } },
      { status: 404 },
    );
  }

  if (order.status === "PAID") {
    return NextResponse.json({
      data: { status: "completed", orderNumber },
    });
  }

  try {
    const session = await initiatePayment(payment.id);
    return NextResponse.json({ data: session });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Payment initiation failed.",
        },
      },
      { status: 500 },
    );
  }
}
