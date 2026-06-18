import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { APP_NAME } from "@/lib/constants";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-lg font-semibold tracking-tight"
      >
        {APP_NAME}
      </Link>
      {children}
    </div>
  );
}
