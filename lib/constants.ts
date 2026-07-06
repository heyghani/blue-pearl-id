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
const DEFAULT_SUPPORT_EMAIL = "support@primeluxr.com";
const DEFAULT_NOREPLY_EMAIL = "noreply@primeluxr.com";

/** Sender address for transactional email (Resend). Set via EMAIL_FROM. */
export const NOREPLY_EMAIL =
  process.env.EMAIL_FROM?.trim() || DEFAULT_NOREPLY_EMAIL;

/** Reply-To header for outbound email (server). Set via EMAIL_REPLY_TO. */
export const EMAIL_REPLY_TO =
  process.env.EMAIL_REPLY_TO?.trim() ||
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
  DEFAULT_SUPPORT_EMAIL;

/** Customer-facing support address (footer, legal pages). Set via NEXT_PUBLIC_SUPPORT_EMAIL. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
  process.env.EMAIL_REPLY_TO?.trim() ||
  DEFAULT_SUPPORT_EMAIL;
const DEFAULT_WHATSAPP_PHONE = "8618859725373";
const DEFAULT_WHATSAPP_NUMBER = "+86 188 5972 5373";

/** Digits-only number for wa.me links (set via NEXT_PUBLIC_WHATSAPP_PHONE). */
export const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "") ||
  DEFAULT_WHATSAPP_PHONE;

/** Human-readable display number (set via NEXT_PUBLIC_WHATSAPP_NUMBER). */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || DEFAULT_WHATSAPP_NUMBER;

export function buildWhatsAppUrl(phone: string, message?: string) {
  const url = `https://wa.me/${phone}`;
  if (!message) return url;
  return `${url}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = buildWhatsAppUrl(WHATSAPP_PHONE);
