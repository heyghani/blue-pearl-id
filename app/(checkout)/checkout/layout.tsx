import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[var(--pearl-light)]/30">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to cart
            </Link>
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--pearl-light)] px-3 py-1 text-xs font-medium text-[var(--pearl)]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              <span>{t.checkout.secureBadge}</span>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
