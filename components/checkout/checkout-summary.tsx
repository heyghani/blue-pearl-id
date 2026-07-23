import Image from "next/image";

import { DutiesNotice } from "@/components/shared/duties-notice";
import { Price } from "@/components/shared/price";
import { Separator } from "@/components/ui/separator";
import { getCheckoutDraft } from "@/lib/checkout/draft";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import {
  getVariantLabel,
  resolveVariantImageUrl,
} from "@/lib/products/variants";
import { getCheckoutCart } from "@/lib/services/cart.service";
import { calculateCheckoutTotals } from "@/lib/services/order.service";
import { cn } from "@/lib/utils";

export async function CheckoutSummary({
  className,
  showTotals = false,
}: {
  className?: string;
  showTotals?: boolean;
}) {
  const [cart, locale] = await Promise.all([getCheckoutCart(), getLocale()]);
  const t = getDictionary(locale);
  const draft = await getCheckoutDraft();

  if (!cart) return null;

  let totals = null;
  if (showTotals && draft.shippingMethod) {
    const result = await calculateCheckoutTotals(
      cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      draft.shippingMethod,
      draft.couponCode,
    );
    if (!("error" in result)) {
      totals = result;
    }
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const unitPrice = Number(item.variant?.price ?? item.product.price);
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <h2 className="text-lg font-semibold">{t.checkout.orderSummary}</h2>

      <ul className="mt-4 space-y-4">
        {cart.items.map((item) => {
          const unitPrice = Number(item.variant?.price ?? item.product.price);
          const variantLabel = getVariantLabel(item.variant);
          const imageUrl = resolveVariantImageUrl(
            item.variant
              ? {
                  imageUrl: item.variant.imageUrl,
                  optionValueIds: item.variant.optionValues.map(
                    (entry) => entry.optionValueId,
                  ),
                }
              : null,
            (item.product.variants ?? []).map((sibling) => ({
              imageUrl: sibling.imageUrl,
              isActive: sibling.isActive,
              optionValueIds: sibling.optionValues.map(
                (entry) => entry.optionValueId,
              ),
            })),
            item.product.images[0]?.url ?? null,
          );

          return (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={
                      variantLabel
                        ? `${item.product.name} — ${variantLabel}`
                        : item.product.name
                    }
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{item.product.name}</p>
                {variantLabel ? (
                  <p className="text-xs text-muted-foreground">{variantLabel}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {t.checkout.qty} {item.quantity}
                </p>
              </div>
              <Price
                amount={(unitPrice * item.quantity).toFixed(2)}
                className="shrink-0 text-sm"
              />
            </li>
          );
        })}
      </ul>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.checkout.subtotal}</span>
          <Price amount={totals?.subtotal ?? subtotal.toFixed(2)} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t.checkout.shippingLabel}</span>
          <span>
            {totals ? (
              <Price amount={totals.shipping} />
            ) : (
              <span className="text-muted-foreground">{t.checkout.atNextStep}</span>
            )}
          </span>
        </div>
        {totals && Number(totals.discount) > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>{t.checkout.discount}</span>
            <span>-<Price amount={totals.discount} /></span>
          </div>
        )}
      </div>

      {totals && (
        <>
          <Separator className="my-4" />
          <div className="flex justify-between font-medium">
            <span>{t.checkout.total}</span>
            <Price amount={totals.total} />
          </div>
        </>
      )}

      <DutiesNotice className="mt-4" />
    </div>
  );
}
