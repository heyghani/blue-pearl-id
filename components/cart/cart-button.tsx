"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/use-cart";
import { cn } from "@/lib/utils";

export function CartButton({
  itemCount: initialCount,
  className,
}: {
  itemCount: number;
  className?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cart, itemCount, isLoading, refresh } = useCart(initialCount);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={() => {
          setDrawerOpen(true);
          void refresh();
        }}
        aria-label={`Cart, ${itemCount} items`}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Button>

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        isLoading={isLoading}
        onRefresh={refresh}
      />
    </>
  );
}

export function CartLink({ itemCount: initialCount }: { itemCount: number }) {
  const { itemCount } = useCart(initialCount);

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/cart" aria-label={`Cart, ${itemCount} items`}>
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
