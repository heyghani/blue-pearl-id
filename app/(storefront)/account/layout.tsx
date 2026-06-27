import { UserRole } from "@prisma/client";

import { AccountNav } from "@/components/account/account-nav";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight">Account</h1>
          <AccountNav isAdmin={isAdmin} />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
