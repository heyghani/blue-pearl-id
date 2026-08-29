import {
  ENABLE_CREDIT_CARD_PAYMENT,
  ENABLE_USDT_PAYMENT,
} from "@/lib/constants";

export type CheckoutPaymentMethodId = "CREDIT_CARD" | "PAYPAL" | "USDT";

export function getDefaultCheckoutPaymentMethod(): CheckoutPaymentMethodId {
  if (ENABLE_CREDIT_CARD_PAYMENT) return "CREDIT_CARD";
  if (ENABLE_USDT_PAYMENT) return "USDT";
  return "PAYPAL";
}

export function isPayPalMethod(method?: string | null) {
  return method === "PAYPAL";
}
