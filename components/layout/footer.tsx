"use client";

import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { useTranslations } from "@/components/i18n/locale-provider";
import { APP_NAME, SUPPORT_EMAIL, WHATSAPP_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations();

  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(t.whatsapp.prefilledMessage)}`;

  const footerSections = [
    {
      title: t.footer.shop,
      links: [
        { href: "/products", label: t.footer.allProducts },
        { href: "/products?featured=true", label: t.nav.featured },
        { href: "/products?sort=newest", label: t.footer.newArrivals },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { href: "/legal/shipping", label: t.nav.shipping },
        { href: "/legal/refunds", label: t.footer.returns },
        { href: whatsappHref, label: t.footer.whatsapp, external: true },
        { href: `mailto:${SUPPORT_EMAIL}`, label: t.footer.contact },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: "/legal/privacy", label: t.footer.privacy },
        { href: "/legal/terms", label: t.footer.terms },
      ],
    },
  ];

  return (
    <footer className="border-t bg-[var(--pearl-light)]/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <p className="text-lg font-bold tracking-tight">{APP_NAME}</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t.footer.tagline}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#128C7E] hover:underline"
              >
                {t.footer.whatsapp}: {t.whatsapp.label}
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-foreground hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold">{section.title}</p>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. {t.footer.copyright}
          </p>
          <p>{t.footer.priceNote}</p>
        </div>
      </div>
    </footer>
  );
}
