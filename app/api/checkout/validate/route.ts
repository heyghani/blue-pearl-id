import { NextResponse } from "next/server";

import { getCheckoutCart } from "@/lib/services/cart.service";
import { calculateCheckoutTotals } from "@/lib/services/order.service";
import { checkoutValidateSchema } from "@/lib/validations/checkout";
import { TAX_NOTICE } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutValidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid checkout data" } },
      { status: 400 },
    );
  }

  const cart = await getCheckoutCart();
  if (!cart) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Cart is empty" } },
      { status: 404 },
    );
  }

  const totals = await calculateCheckoutTotals(
    cart.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    parsed.data.shippingMethod!,
    parsed.data.couponCode,
  );

  if ("error" in totals) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: totals.error } },
      { status: 409 },
    );
  }

  return NextResponse.json({
    data: {
      valid: true,
      totals,
      taxNotice: TAX_NOTICE,
    },
  });
}
