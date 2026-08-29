import { Price } from "@/components/shared/price";

export function PlatformFeeRow({
  label,
  calculation,
  amount,
}: {
  label: string;
  calculation?: string;
  amount: number | string;
}) {
  const displayAmount =
    typeof amount === "number" ? amount.toFixed(2) : amount;

  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">
        {label}
        {calculation ? (
          <span className="mt-0.5 block text-xs">{calculation}</span>
        ) : null}
      </span>
      <Price amount={displayAmount} />
    </div>
  );
}
