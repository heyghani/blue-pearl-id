"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav({
  className,
  isAdmin = false,
}: {
  className?: string;
  isAdmin?: boolean;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/products", label: t.nav.shop },
    { href: "/products?featured=true", label: t.nav.featured },
    { href: "/#faq", label: t.nav.faq },
    { href: "/legal/shipping", label: t.nav.shipping },
  ];

  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(t.whatsapp.prefilledMessage)}`;

  return (
    <div className={cn("md:hidden", className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open ? (
        <nav className="absolute left-0 right-0 top-16 z-50 border-b bg-background/95 px-4 py-4 shadow-sm backdrop-blur">
          <div className="mb-4">
            <LanguageSwitcher className="w-full" />
          </div>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdmin ? (
              <li>
                <Link
                  href="/admin"
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              </li>
            ) : null}
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#128C7E] hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {t.footer.whatsapp}
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
