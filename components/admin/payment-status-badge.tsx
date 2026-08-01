import { PaymentStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Partial<Record<PaymentStatus, string>> = {
  CAPTURED: "bg-emerald-100 text-emerald-800",
  AUTHORIZED: "bg-blue-100 text-blue-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  PARTIALLY_REFUNDED: "bg-purple-100 text-purple-800",
  EXPIRED: "bg-zinc-100 text-zinc-600",
  CANCELLED: "bg-zinc-100 text-zinc-700",
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus | string;
  className?: string;
}) {
  const label = status.toLowerCase().replace(/_/g, " ");

  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize",
        statusStyles[status as PaymentStatus],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
