export const APP_NAME = "Global Luxury OEM Factory - Shipping Worldwide";
export const APP_DESCRIPTION =
  "Luxury OEM handbags and accessories — crafted with timeless design, shipped worldwide.";
export const CURRENCY = "USD";
export const ENABLE_CREDIT_CARD_PAYMENT =
  process.env.NEXT_PUBLIC_ENABLE_CREDIT_CARD_PAYMENT === "true";
export const TAX_NOTICE =
  "Import duties and local taxes are not included. Your carrier may collect them on delivery.";
export const SUPPORT_EMAIL = "support@bluepearlid.com";
export const NOREPLY_EMAIL = "noreply@bluepearlid.com";
export type WhatsAppContact = {
  display: string;
  phone: string;
};

export const WHATSAPP_CONTACTS: WhatsAppContact[] = [
  { display: "+86 188 5972 5373", phone: "8618859725373" },
  { display: "+86 150 6084 2734", phone: "8615060842734" },
];

export function buildWhatsAppUrl(phone: string, message?: string) {
  const url = `https://wa.me/${phone}`;
  if (!message) return url;
  return `${url}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_NUMBER = WHATSAPP_CONTACTS[0].display;
export const WHATSAPP_PHONE = WHATSAPP_CONTACTS[0].phone;
export const WHATSAPP_URL = buildWhatsAppUrl(WHATSAPP_PHONE);
