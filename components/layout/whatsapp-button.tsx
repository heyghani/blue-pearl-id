"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { WHATSAPP_PHONE, buildWhatsAppUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WhatsAppButton() {
  const t = useTranslations();
  const pathname = usePathname();
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname ?? "");

  const href = buildWhatsAppUrl(WHATSAPP_PHONE, t.whatsapp.prefilledMessage);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.ariaLabel}
      className={cn(
        "fixed right-4 z-50 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        isProductDetail ? "bottom-24 h-12 w-12" : "bottom-5 h-14 w-14",
      )}
    >
      <MessageCircle className="h-6 w-6" fill="currentColor" strokeWidth={0} />
    </a>
  );
}
