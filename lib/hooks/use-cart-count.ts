"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { CART_UPDATED_EVENT } from "@/lib/cart/events";

async function fetchCartCount() {
  const response = await fetch("/api/cart", { cache: "no-store" });
  if (!response.ok) return 0;

  const payload = (await response.json()) as { data?: { itemCount?: number } };
  return payload.data?.itemCount ?? 0;
}

export function useCartCount(initialCount: number) {
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    const nextCount = await fetchCartCount();
    setCount(nextCount);
  }, []);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const handleUpdate = () => {
      void refresh();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleUpdate);
  }, [refresh]);

  return count;
}
