import { NextResponse } from "next/server";

import type { NowPaymentsIpnPayload } from "@/lib/payments/nowpayments";
import { syncPaymentFromNowPayments } from "@/lib/services/payment.service";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-nowpayments-sig");
    const payload = (await request.json()) as NowPaymentsIpnPayload;
    const result = await syncPaymentFromNowPayments(payload, signature);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[nowpayments webhook]", error);
    const isAuthError =
      error instanceof Error && error.message.includes("signature");
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Webhook processing failed.",
        },
      },
      { status: isAuthError ? 401 : 500 },
    );
  }
}
