"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { CartItemRow } from "@/components/cart/cart-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDrawerDirection } from "@/lib/hooks/use-drawer-direction";
import type { CartView } from "@/lib/services/cart.service";

export function CartDrawer({
  open,
  onClose,
  cart,
  isLoading,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartView;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const t = useTranslations();
  const direction = useDrawerDirection(open);
  const hasItems = cart.items.length > 0;
  const itemLabel = cart.itemCount === 1 ? t.cart.item : t.cart.items;

  return (
    <Drawer
      open={open}
      direction={direction}
      shouldScaleBackground={false}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DrawerContent className="h-[90dvh] max-h-[90dvh] md:h-full md:max-h-none">
        <DrawerHeader className="shrink-0 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>{t.cart.title}</DrawerTitle>
              {hasItems ? (
                <DrawerDescription>
                  {cart.itemCount} {itemLabel}
                </DrawerDescription>
              ) : null}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label={t.cart.close}>
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {isLoading && !hasItems ? (
            <div className="space-y-4 py-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-muted" />
                  <div className="flex flex-1 flex-col gap-2 py-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasItems ? (
            <ul className="divide-y">
              {cart.items.map((item) => (
                <li key={item.id} className="py-4 first:pt-1">
                  <CartItemRow item={item} compact onUpdated={onRefresh} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <p className="text-sm text-muted-foreground">{t.cart.emptyDrawer}</p>
              <Button className="mt-5 rounded-full" variant="outline" asChild>
                <Link href="/products">{t.cart.continueShopping}</Link>
              </Button>
            </div>
          )}
        </div>

        {hasItems ? (
          <DrawerFooter className="shrink-0">
            <OrderSummary
              cart={cart}
              variant="drawer"
              showCheckout
              onCheckoutClick={onClose}
            />
            <Button variant="link" className="h-auto w-full py-1 text-sm" asChild>
              <Link href="/cart" onClick={onClose}>
                {t.cart.viewFullCart}
              </Link>
            </Button>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
