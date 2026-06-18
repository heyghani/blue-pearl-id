import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface PriceProps {
  amount: number | string;
  compareAt?: number | string | null;
  className?: string;
}

export function Price({ amount, compareAt, className }: PriceProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-semibold tracking-tight">
        {formatPrice(amount)}
      </span>
      {compareAt != null && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(compareAt)}
        </span>
      )}
    </div>
  );
}
