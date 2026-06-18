import { NextResponse } from "next/server";

import { getCart } from "@/lib/services/cart.service";

export async function GET() {
  const cart = await getCart();
  return NextResponse.json({ data: cart });
}
