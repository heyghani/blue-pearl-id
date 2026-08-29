"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WHATSAPP_PHONE, buildWhatsAppUrl } from "@/lib/constants";
import { useCart } from "@/lib/hooks/use-cart";
import { trackWhatsAppPopupClick } from "@/lib/whatsapp/follow-up-analytics";
import {
  getFollowUpContext,
  interpolate,
  isPopupDismissed,
  markPopupDismissed,
  markPopupShownThisSession,
  readProductNameFromPage,
  wasPopupShownThisSession,
  type FollowUpPageType,
  type FollowUpTrigger,
} from "@/lib/whatsapp/follow-up-triggers";

function getPopupCopy(
  pageType: FollowUpPageType,
  productName: string | undefined,
  t: ReturnType<typeof useTranslations>,
) {
  const popup = t.whatsapp.popup;

  switch (pageType) {
    case "product":
      return {
        title: popup.titleProduct,
        description: productName
          ? interpolate(popup.descriptionProduct, { productName })
          : popup.descriptionProductFallback,
        message: productName
          ? interpolate(popup.prefilledMessageProduct, { productName })
          : popup.prefilledMessageHome,
      };
    case "cart":
      return {
        title: popup.titleCart,
        description: popup.descriptionCart,
        message: popup.prefilledMessageCart,
      };
    case "browse":
      return {
        title: popup.titleBrowse,
        description: popup.descriptionBrowse,
        message: popup.prefilledMessageBrowse,
      };
    default:
      return {
        title: popup.titleHome,
        description: popup.descriptionHome,
        message: popup.prefilledMessageHome,
      };
  }
}

export function WhatsAppFollowUpPopup() {
  const t = useTranslations();
  const pathname = usePathname() ?? "";
  const { itemCount, refresh } = useCart();
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<FollowUpTrigger>("time");
  const [productName, setProductName] = useState<string | undefined>();
  const shownRef = useRef(false);

  const hasCartItems = itemCount > 0;
  const context = useMemo(
    () => getFollowUpContext(pathname, hasCartItems),
    [pathname, hasCartItems],
  );

  const showPopup = useCallback(
    (nextTrigger: FollowUpTrigger) => {
      if (shownRef.current) return;
      if (isPopupDismissed()) return;
      if (wasPopupShownThisSession()) return;
      if (!context) return;

      shownRef.current = true;
      markPopupShownThisSession();
      setProductName(readProductNameFromPage());
      setTrigger(nextTrigger);
      setOpen(true);
    },
    [context],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    shownRef.current = false;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!context) return;
    if (isPopupDismissed()) return;
    if (wasPopupShownThisSession()) return;

    const timer = window.setTimeout(() => {
      showPopup("time");
    }, context.delayMs);

    return () => window.clearTimeout(timer);
  }, [context, showPopup]);

  useEffect(() => {
    if (!context?.enableExitIntent) return;
    if (isPopupDismissed()) return;
    if (wasPopupShownThisSession()) return;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      showPopup("exit_intent");
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [context, showPopup]);

  const dismiss = useCallback(() => {
    markPopupDismissed();
    setOpen(false);
  }, []);

  if (!context) return null;

  const pageType = context.pageType;
  const copy = getPopupCopy(pageType, productName, t);
  const whatsAppHref = buildWhatsAppUrl(WHATSAPP_PHONE, copy.message);

  const handleWhatsAppClick = () => {
    trackWhatsAppPopupClick({
      trigger,
      pageType,
      productName,
    });
    markPopupDismissed();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent className="gap-5 sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 sm:mx-0">
            <MessageCircle className="h-6 w-6 text-[#128C7E]" fill="currentColor" strokeWidth={0} />
          </div>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:flex-col">
          <Button
            asChild
            className="w-full rounded-full bg-[#25D366] text-white hover:bg-[#20BD5A]"
          >
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              {t.whatsapp.popup.cta}
            </a>
          </Button>
          <Button variant="ghost" className="w-full" onClick={dismiss}>
            {t.whatsapp.popup.dismiss}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
