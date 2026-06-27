"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { useTranslations } from "@/components/i18n/locale-provider";
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
  const t = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { cart, itemCount, isLoading, refresh } = useCart(initialCount);
  const cartAria = t.cart.cartAria.replace("{count}", String(itemCount));

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
        aria-label={cartAria}
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
  const t = useTranslations();
  const { itemCount } = useCart(initialCount);
  const cartAria = t.cart.cartAria.replace("{count}", String(itemCount));

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href="/cart" aria-label={cartAria}>
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
