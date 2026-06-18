import { CURRENCY } from "@/lib/constants";

export function formatPrice(
  amount: number | string,
  options?: { showCurrency?: boolean },
) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
  }).format(value);

  if (options?.showCurrency === false) {
    return formatted;
  }

  return `${formatted} ${CURRENCY}`;
}
