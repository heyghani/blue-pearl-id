import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?sort=newest", label: "New Arrivals" },
  ],
  support: [
    { href: "/legal/shipping", label: "Shipping" },
    { href: "/legal/refunds", label: "Returns" },
    { href: `mailto:${SUPPORT_EMAIL}`, label: "Contact" },
  ],
  legal: [
    { href: "/legal/privacy", label: "Privacy" },
    { href: "/legal/terms", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-semibold">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground">
              Premium pearls and fine jewelry for collectors worldwide.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <p className="text-sm font-medium capitalize">{section}</p>
              <ul className="space-y-2">
                {links.map((link) => (
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

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
