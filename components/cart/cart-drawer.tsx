"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { CartItemRow } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import type { CartView } from "@/lib/services/cart.service";
import { cn } from "@/lib/utils";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      setCart(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCart();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, loadCart]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close cart"
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-xl",
          "animate-in slide-in-from-right duration-200",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && !cart ? (
            <p className="text-sm text-muted-foreground">Loading cart…</p>
          ) : cart && cart.items.length > 0 ? (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  compact
                  onUpdated={loadCart}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Button className="mt-4" variant="outline" asChild onClick={onClose}>
                <Link href="/products">Continue shopping</Link>
              </Button>
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="border-t p-4">
            <OrderSummary cart={cart} showCheckout />
            <Button variant="link" className="mt-2 w-full" asChild>
              <Link href="/cart" onClick={onClose}>
                View full cart
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
