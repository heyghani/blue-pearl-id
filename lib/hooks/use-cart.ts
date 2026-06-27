"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { CART_UPDATED_EVENT } from "@/lib/cart/events";
import type { CartView } from "@/lib/services/cart.service";

const emptyCart: CartView = {
  id: null,
  items: [],
  itemCount: 0,
  subtotal: "0.00",
};

async function fetchCart(): Promise<CartView> {
  const response = await fetch("/api/cart", { cache: "no-store" });
  if (!response.ok) return emptyCart;

  const payload = (await response.json()) as { data?: CartView };
  return payload.data ?? emptyCart;
}

export function useCart(initialItemCount = 0) {
  const pathname = usePathname();
  const [cart, setCart] = useState<CartView>(() => ({
    ...emptyCart,
    itemCount: initialItemCount,
  }));
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setCart(await fetchCart());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void fetchCart().then((data) => {
      if (active) {
        setCart(data);
      }
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleUpdate = () => {
      void fetchCart().then(setCart);
    };

    window.addEventListener(CART_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleUpdate);
  }, []);

  const itemCount =
    cart.items.length === 0 && cart.itemCount === 0
      ? initialItemCount
      : cart.itemCount;

  return { cart, itemCount, isLoading, refresh };
}
