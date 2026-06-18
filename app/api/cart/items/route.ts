import { NextResponse } from "next/server";

import { addToCart } from "@/lib/services/cart.service";
import { addToCartSchema } from "@/lib/validations/cart";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = addToCartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request" } },
      { status: 400 },
    );
  }

  const result = await addToCart(parsed.data.productId, parsed.data.quantity);

  if (result.error) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: result.error } },
      { status: 409 },
    );
  }

  return NextResponse.json({ data: result.cart });
}
