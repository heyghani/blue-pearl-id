"use client";

import Link from "next/link";

import { useTranslations } from "@/components/i18n/locale-provider";
import { CheckoutSecureNotice } from "@/components/checkout/checkout-secure-notice";
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
  cart: Pick<
    CartView,
    | "subtotal"
    | "merchandiseSubtotal"
    | "quantityDiscount"
    | "itemCount"
    | "estimatedShipping"
    | "estimatedTotal"
  >;
  className?: string;
  showCheckout?: boolean;
  variant?: "full" | "drawer";
  onCheckoutClick?: () => void;
}) {
  const t = useTranslations();
  const itemLabel = cart.itemCount === 1 ? t.cart.item : t.cart.items;
  const subtotalLabel = t.cart.subtotalWithCount
    .replace("{count}", String(cart.itemCount))
    .replace("{label}", itemLabel);
  const isDrawer = variant === "drawer";
  const quantityDiscountAmount = Number(cart.quantityDiscount);

  return (
    <div
      className={cn(
        isDrawer ? "space-y-3" : "space-y-4 rounded-xl border border-border/70 bg-card p-6 shadow-sm",
        className,
      )}
    >
      {!isDrawer ? (
        <h2 className="font-display text-lg font-semibold tracking-tight">{t.cart.orderSummary}</h2>
      ) : null}

      <div className={cn("space-y-2", isDrawer ? "text-sm" : "text-sm")}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{subtotalLabel}</span>
          <Price
            amount={cart.merchandiseSubtotal}
            className={isDrawer ? "text-sm font-semibold" : undefined}
          />
        </div>
        {quantityDiscountAmount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>{t.cart.quantityDiscount}</span>
            <span>
              -<Price amount={cart.quantityDiscount} className={isDrawer ? "text-sm" : undefined} />
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.cart.shipping}</span>
          {cart.itemCount > 0 ? (
            <Price amount={cart.estimatedShipping} className={isDrawer ? "text-sm" : undefined} />
          ) : (
            <span className="text-muted-foreground">{t.cart.shippingAtCheckout}</span>
          )}
        </div>
      </div>

      {!isDrawer ? (
        <>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>{t.cart.estimatedTotal}</span>
            <Price amount={cart.estimatedTotal} />
          </div>
          <DutiesNotice message={t.common.taxNotice} />
        </>
      ) : cart.itemCount > 0 ? (
        <div className="flex justify-between font-medium">
          <span>{t.cart.estimatedTotal}</span>
          <Price amount={cart.estimatedTotal} />
        </div>
      ) : null}

      {showCheckout && cart.itemCount > 0 ? (
        <div className="space-y-2">
          <Button
            className={cn(
              "w-full rounded-md font-display text-sm font-semibold uppercase tracking-wide",
              isDrawer && "h-12",
            )}
            size={isDrawer ? "default" : "lg"}
            asChild
          >
            <Link href="/checkout" onClick={onCheckoutClick}>
              {t.cart.proceedToCheckout}
            </Link>
          </Button>
          {!isDrawer ? <CheckoutSecureNotice /> : null}
        </div>
      ) : null}
    </div>
  );
}
