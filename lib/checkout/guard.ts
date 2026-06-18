import { redirect } from "next/navigation";

import { getCheckoutCart } from "@/lib/services/cart.service";

export async function requireCheckoutCart() {
  const cart = await getCheckoutCart();
  if (!cart) {
    redirect("/cart");
  }
  return cart;
}
