import { NextResponse } from "next/server";

import type { MidtransNotification } from "@/lib/payments/midtrans";
import { syncPaymentFromMidtrans } from "@/lib/services/payment.service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MidtransNotification;
    const result = await syncPaymentFromMidtrans(payload);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[midtrans webhook]", error);
    const isAuthError =
      error instanceof Error && error.message.includes("signature");
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Webhook processing failed.",
        },
      },
      { status: isAuthError ? 401 : 500 },
    );
  }
}
