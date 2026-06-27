import Link from "next/link";

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="max-w-[11rem] font-display text-xs font-semibold leading-tight tracking-tight sm:max-w-none sm:text-base md:text-lg"
          >
            {APP_NAME}
          </Link>
          <Link
            href="/cart"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.checkout.backToBag}
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
