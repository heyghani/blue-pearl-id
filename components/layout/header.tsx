import Link from "next/link";
import { Search, User, LayoutDashboard } from "lucide-react";
import { UserRole } from "@prisma/client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartButton } from "@/components/cart/cart-button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { getCartItemCount } from "@/lib/services/cart.service";

export async function Header() {
  const session = await getSession();
  const itemCount = await getCartItemCount();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const isAdmin = session?.user?.role === UserRole.ADMIN;

  const navLinks = [
    { href: "/products", label: t.nav.shop },
    { href: "/products?featured=true", label: t.nav.featured },
    { href: "/#faq", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav isAdmin={isAdmin} />
          <Link
            href="/"
            className="max-w-[11rem] font-display text-xs font-semibold leading-tight tracking-tight sm:max-w-none sm:text-base md:text-lg lg:text-xl"
          >
            {APP_NAME}
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <Button variant="ghost" size="icon" aria-label={t.nav.search} asChild>
            <Link href="/products">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {session?.user ? (
            <>
              {isAdmin ? (
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/admin">
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/account">
                  <User className="mr-1.5 h-4 w-4" />
                  {t.nav.account}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                <Link href="/account" aria-label={t.nav.account}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <div className="hidden lg:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t.nav.signIn}</Link>
            </Button>
          )}

          <CartButton itemCount={itemCount} />
        </div>
      </div>
    </header>
  );
}
