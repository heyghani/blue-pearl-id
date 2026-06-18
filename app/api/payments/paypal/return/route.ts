import { redirect } from "next/navigation";

import { syncPaymentFromPayPalCapture } from "@/lib/services/payment.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");
  const token = searchParams.get("token");

  if (!orderNumber || !token) {
    redirect("/cart");
  }

  try {
    const result = await syncPaymentFromPayPalCapture(token, orderNumber);

    if (result.status === "CAPTURED") {
      redirect(`/checkout/confirmation/${orderNumber}`);
    }

    redirect(`/payment/failed?order=${orderNumber}`);
  } catch (error) {
    console.error("[paypal return]", error);
    redirect(`/payment/failed?order=${orderNumber}`);
  }
}

// redirect() throws; satisfy TypeScript
export const dynamic = "force-dynamic";
