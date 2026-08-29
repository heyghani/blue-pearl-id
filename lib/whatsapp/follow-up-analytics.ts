"use client";

import { trackMetaPixelEvent } from "@/lib/analytics/meta-pixel-client";
import type { FollowUpPageType, FollowUpTrigger } from "@/lib/whatsapp/follow-up-triggers";

type WhatsAppPopupClickParams = {
  trigger: FollowUpTrigger;
  pageType: FollowUpPageType;
  productName?: string;
};

export function trackWhatsAppPopupClick({
  trigger,
  pageType,
  productName,
}: WhatsAppPopupClickParams) {
  if (typeof window === "undefined") return;

  const eventId = `wa_popup_${Date.now()}`;

  trackMetaPixelEvent(
    "Contact",
    {
      content_name: "whatsapp_follow_up_popup",
      trigger,
      page_type: pageType,
      ...(productName ? { product_name: productName } : {}),
    },
    eventId,
  );

  window.gtag?.("event", "whatsapp_popup_click", {
    trigger,
    page_type: pageType,
    product_name: productName,
  });
}
