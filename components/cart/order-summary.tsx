import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import type { CartView } from "@/lib/services/cart.service";
import { cn } from "@/lib/utils";

export function OrderSummary({
  cart,
  className,
  showCheckout = true,
}: {
  cart: Pick<CartView, "subtotal" | "itemCount">;
  className?: string;
  showCheckout?: boolean;
}) {
  return (
    <div className={cn("space-y-4 rounded-lg border bg-card p-6", className)}>
      <h2 className="text-lg font-semibold">Order summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
          </span>
          <Price amount={cart.subtotal} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-medium">
        <span>Estimated total</span>
        <Price amount={cart.subtotal} />
      </div>

      <DutiesNotice />

      {showCheckout && cart.itemCount > 0 && (
        <Button className="w-full" size="lg" asChild>
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
      )}
    </div>
  );
}
