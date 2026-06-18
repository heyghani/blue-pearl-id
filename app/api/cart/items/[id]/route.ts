import { NextResponse } from "next/server";

import {
  removeCartItem,
  updateCartItem,
} from "@/lib/services/cart.service";
import { updateCartItemSchema } from "@/lib/validations/cart";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateCartItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid quantity" } },
      { status: 400 },
    );
  }

  const result = await updateCartItem(id, parsed.data.quantity);

  if (result.error && !result.cart) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: result.error } },
      { status: 404 },
    );
  }

  if (result.error) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: result.error } },
      { status: 409 },
    );
  }

  return NextResponse.json({ data: result.cart });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await removeCartItem(id);

  if (result.error) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: result.error } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: result.cart });
}
