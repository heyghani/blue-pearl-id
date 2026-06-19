import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

const footerSections = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/products?featured=true", label: "Featured" },
      { href: "/products?sort=newest", label: "New Arrivals" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/legal/shipping", label: "Shipping" },
      { href: "/legal/refunds", label: "Returns" },
      { href: `mailto:${SUPPORT_EMAIL}`, label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-[var(--pearl-light)]/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium pearls and fine jewelry for collectors worldwide. Secure checkout,
              transparent USD pricing, and delivery to your door.
            </p>
            <p className="text-sm text-muted-foreground">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-foreground hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold">{section.title}</p>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p>Prices in USD · Worldwide shipping</p>
        </div>
      </div>
    </footer>
  );
}
