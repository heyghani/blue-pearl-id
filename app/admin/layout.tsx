import { getSession } from "@/lib/auth";

import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AdminShell
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
