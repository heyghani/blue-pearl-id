export const APP_NAME = "PrimeLuxr";
export const APP_TAGLINE = "Luxury OEM · Shipped Worldwide";
export const APP_DESCRIPTION =
  "Luxury OEM handbags and accessories — crafted with timeless design, shipped worldwide.";
/** Customer-facing name on PayPal checkout and Midtrans Snap (max ~22 chars for card statements). */
export const PAYMENT_MERCHANT_NAME =
  process.env.PAYMENT_MERCHANT_NAME ?? APP_NAME;
export const CURRENCY = "USD";
export const ENABLE_CREDIT_CARD_PAYMENT =
  process.env.NEXT_PUBLIC_ENABLE_CREDIT_CARD_PAYMENT === "true";
export const TAX_NOTICE =
  "Import duties and local taxes are not included. Your carrier may collect them on delivery.";
export const SUPPORT_EMAIL = "support@primeluxr.com";
export const NOREPLY_EMAIL = "noreply@primeluxr.com";
export const WHATSAPP_NUMBER = "+86 188 5972 5373";
export const WHATSAPP_PHONE = "8618859725373";

export function buildWhatsAppUrl(phone: string, message?: string) {
  const url = `https://wa.me/${phone}`;
  if (!message) return url;
  return `${url}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = buildWhatsAppUrl(WHATSAPP_PHONE);
