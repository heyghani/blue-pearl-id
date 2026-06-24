import Link from "next/link";
import { redirect } from "next/navigation";

import { CartItemRow } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProductBySlug } from "@/lib/products";
import { addToCart, getCart } from "@/lib/services/cart.service";

export const dynamic = "force-dynamic";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ buy?: string }>;
}) {
  const { buy } = await searchParams;

  if (buy) {
    const product = await getProductBySlug(buy);
    if (product) {
      await addToCart(product.id, 1);
    }
    redirect("/cart");
  }

  const cart = await getCart();

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection and add something you love.
        </p>
        <Button className="mt-8" asChild>
          <Link href="/products">Shop all products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
      <p className="mt-1 text-muted-foreground">
        {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {cart.items.map((item, index) => (
            <div key={item.id}>
              <CartItemRow item={item} />
              {index < cart.items.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary cart={cart} />
          <Button variant="link" className="mt-4 px-0" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
