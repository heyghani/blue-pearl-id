import { getCheckoutCart } from "@/lib/services/cart.service";

export async function requireCheckoutCartApi() {
  const cart = await getCheckoutCart();
  if (!cart || cart.items.length === 0) {
    return null;
  }

  return cart;
}
