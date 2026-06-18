import { OrderStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Partial<Record<OrderStatus, string>> = {
  PAID: "bg-emerald-100 text-emerald-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  PENDING: "bg-amber-100 text-amber-800",
  PAYMENT_PROCESSING: "bg-amber-100 text-amber-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-zinc-100 text-zinc-700",
  REFUNDED: "bg-purple-100 text-purple-800",
  EXPIRED: "bg-zinc-100 text-zinc-600",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus | string;
  className?: string;
}) {
  const label = status.toLowerCase().replace(/_/g, " ");

  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize",
        statusStyles[status as OrderStatus],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
