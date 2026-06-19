export {
  clearExchangeRateCache,
  convertUsdToIdrLive,
  convertUsdToIdrWithRate,
  getUsdToIdrRate,
} from "@/lib/payments/exchange-rate";
export type { ExchangeRateQuote, ExchangeRateSource } from "@/lib/payments/exchange-rate";

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdToIdrRate(rate: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(rate);
}
