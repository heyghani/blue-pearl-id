import Link from "next/link";
import { Search, User } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CartButton } from "@/components/cart/cart-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getCartItemCount } from "@/lib/services/cart.service";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/#faq", label: "FAQ" },
];

export async function Header() {
  const session = await auth();
  const itemCount = await getCartItemCount();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          {session?.user ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/account">
                  <User className="mr-1.5 h-4 w-4" />
                  Account
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                <Link href="/account" aria-label="Account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <div className="hidden lg:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          <CartButton itemCount={itemCount} />
        </div>
      </div>
    </header>
  );
}
