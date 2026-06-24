"use server";

import { revalidatePath } from "next/cache";

import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/services/cart.service";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "@/lib/validations/cart";

export type CartActionState = {
  error?: string;
  success?: string;
};

function revalidateCartPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/cart", "layout");
  revalidatePath("/products", "layout");
}

export async function addToCartAction(
  productId: string,
  quantity = 1,
  variantId?: string,
): Promise<CartActionState> {
  const parsed = addToCartSchema.safeParse({ productId, quantity, variantId });
  if (!parsed.success) {
    return { error: "Invalid product or quantity." };
  }

  const result = await addToCart(
    parsed.data.productId,
    parsed.data.quantity,
    parsed.data.variantId,
  );
  if (result.error) return { error: result.error };

  revalidateCartPaths();
  return { success: "Added to cart" };
}

export async function updateCartItemAction(
  itemId: string,
  quantity: number,
): Promise<CartActionState> {
  const parsed = updateCartItemSchema.safeParse({ quantity });
  if (!parsed.success) {
    return { error: "Invalid quantity." };
  }

  const result = await updateCartItem(itemId, parsed.data.quantity);
  if (result.error && !result.cart) return { error: result.error };

  revalidateCartPaths();
  return result.error ? { error: result.error } : { success: "Cart updated" };
}

export async function removeCartItemAction(
  itemId: string,
): Promise<CartActionState> {
  const result = await removeCartItem(itemId);
  if (result.error) return { error: result.error };

  revalidateCartPaths();
  return { success: "Item removed" };
}

export async function fetchCartAction() {
  return getCart();
}
