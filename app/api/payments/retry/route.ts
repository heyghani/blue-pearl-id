import { NextResponse } from "next/server";

import { initiatePayment, retryPayment } from "@/lib/services/payment.service";

export async function POST(request: Request) {
  const body = await request.json();
  const orderNumber = body.orderNumber as string | undefined;
  const paymentMethod = body.paymentMethod as "CREDIT_CARD" | "PAYPAL" | undefined;
  const idempotencyKey = body.idempotencyKey as string | undefined;

  if (!orderNumber || !paymentMethod || !idempotencyKey) {
    return NextResponse.json(
      { error: { message: "Invalid request." } },
      { status: 400 },
    );
  }

  const retry = await retryPayment({ orderNumber, paymentMethod, idempotencyKey });
  if ("error" in retry && retry.error) {
    return NextResponse.json(
      { error: { message: retry.error } },
      { status: 409 },
    );
  }

  try {
    const session = await initiatePayment(retry.paymentId!);
    return NextResponse.json({
      data: {
        ...session,
        orderNumber: retry.orderNumber,
      },
    });
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
