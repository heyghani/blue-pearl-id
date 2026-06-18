import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight">Account</h1>
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
