import { OrderStatus } from "@prisma/client";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const pendingFulfillment = await prisma.order.count({
    where: {
      status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] },
    },
  });

  return (
    <AdminShell
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
      }}
      pendingFulfillment={pendingFulfillment}
    >
      {children}
    </AdminShell>
  );
}
