import { Logo } from "@/components/brand/logo";
import { AuthCard } from "@/components/auth/auth-card";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Logo variant="lockup" className="mb-8" />
      {children}
    </div>
  );
}
