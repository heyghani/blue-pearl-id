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
  variant = "full",
  onCheckoutClick,
}: {
  cart: Pick<CartView, "subtotal" | "itemCount">;
  className?: string;
  showCheckout?: boolean;
  variant?: "full" | "drawer";
  onCheckoutClick?: () => void;
}) {
  const itemLabel = cart.itemCount === 1 ? "item" : "items";
  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        isDrawer ? "space-y-3" : "space-y-4 rounded-lg border bg-card p-6",
        className,
      )}
    >
      {!isDrawer ? (
        <h2 className="text-lg font-semibold">Order summary</h2>
      ) : null}

      <div className={cn("space-y-2", isDrawer ? "text-sm" : "text-sm")}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">
            Subtotal ({cart.itemCount} {itemLabel})
          </span>
          <Price amount={cart.subtotal} className={isDrawer ? "text-sm font-semibold" : undefined} />
        </div>
        {!isDrawer ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">Calculated at checkout</span>
          </div>
        ) : null}
      </div>

      {!isDrawer ? (
        <>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Estimated total</span>
            <Price amount={cart.subtotal} />
          </div>
          <DutiesNotice />
        </>
      ) : null}

      {showCheckout && cart.itemCount > 0 ? (
        <Button
          className={cn("w-full", isDrawer && "h-12 rounded-full text-sm font-semibold")}
          size={isDrawer ? "default" : "lg"}
          asChild
        >
          <Link href="/checkout" onClick={onCheckoutClick}>
            Proceed to checkout
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
