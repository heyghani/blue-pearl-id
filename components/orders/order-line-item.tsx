import Image from "next/image";

import { Price } from "@/components/shared/price";
import {
  formatOrderItemOptionsLabel,
  parseOrderItemOptions,
  splitLegacyProductName,
} from "@/lib/orders/line-item";
import { cn } from "@/lib/utils";

export type OrderLineItemView = {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice?: string | number;
  totalPrice: string | number;
  variantLabel?: string | null;
  optionsJson?: unknown;
  imageUrl?: string | null;
};

export function OrderLineItemRow({
  item,
  className,
  showSku = true,
}: {
  item: OrderLineItemView;
  className?: string;
  showSku?: boolean;
}) {
  const { title, legacyLabel } = splitLegacyProductName(item.productName);
  const options = parseOrderItemOptions(
    item.optionsJson,
    item.variantLabel ?? legacyLabel,
  );
  const optionsLabel = formatOrderItemOptionsLabel(options);

  return (
    <li className={cn("flex gap-3 text-sm", className)}>
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={optionsLabel ? `${title} — ${optionsLabel}` : title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{title}</p>
        {optionsLabel ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{optionsLabel}</p>
        ) : null}
        {showSku ? (
          <p className="mt-0.5 text-xs text-muted-foreground">SKU {item.productSku}</p>
        ) : null}
        <p className="mt-0.5 text-xs text-muted-foreground">Qty {item.quantity}</p>
      </div>
      <Price amount={item.totalPrice.toString()} className="shrink-0 text-sm" />
    </li>
  );
}
