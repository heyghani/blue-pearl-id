import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            <span>Secure checkout</span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
