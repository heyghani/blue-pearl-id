"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { notifyCartUpdated } from "@/lib/cart/events";
import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/actions/cart";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import type { CartLineItem } from "@/lib/services/cart.service";
import { cn } from "@/lib/utils";

export function CartItemRow({
  item,
  compact = false,
  onUpdated,
}: {
  item: CartLineItem;
  compact?: boolean;
  onUpdated?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function mutate(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      notifyCartUpdated();
      router.refresh();
      onUpdated?.();
    });
  }

  const lineTotal = (Number(item.product.price) * item.quantity).toFixed(2);

  return (
    <div className={cn("flex gap-3", isPending && "opacity-60", compact && "gap-3")}>
      <Link
        href={`/products/${item.product.slug}`}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-muted",
          compact ? "h-[72px] w-[72px]" : "h-20 w-20",
        )}
      >
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            —
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${item.product.slug}`}
              className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
            >
              {item.product.name}
            </Link>
            {item.product.variantLabel ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.product.variantLabel}
              </p>
            ) : null}
            <div className="mt-1 flex items-center gap-2">
              <Price amount={item.product.price} className="text-sm" />
              {compact ? (
                <span className="text-xs text-muted-foreground">× {item.quantity}</span>
              ) : null}
            </div>
            {!item.product.inStock ? (
              <p className="mt-1 text-xs text-destructive">Out of stock</p>
            ) : null}
          </div>

          <p className="shrink-0 text-sm font-semibold">
            <Price amount={lineTotal} />
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-full border bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={isPending || item.quantity <= 1}
              onClick={() =>
                mutate(() => updateCartItemAction(item.id, item.quantity - 1))
              }
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={
                isPending ||
                !item.product.inStock ||
                item.quantity >= item.product.maxQuantity
              }
              onClick={() =>
                mutate(() => updateCartItemAction(item.id, item.quantity + 1))
              }
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            disabled={isPending}
            onClick={() => mutate(() => removeCartItemAction(item.id))}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
