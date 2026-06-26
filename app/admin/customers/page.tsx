import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listCustomers } from "@/lib/services/admin/customer.service";
import { Input } from "@/components/ui/input";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { customers, totalPages } = await listCustomers({
    search: params.search,
    page,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Registered customer accounts and order history."
      />

      <form className="max-w-md">
        <Input
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search by name or email…"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-medium hover:underline"
                  >
                    {customer.name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                <td className="px-4 py-3">{customer._count.orders}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {customer.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/customers?page=${p}${params.search ? `&search=${params.search}` : ""}`}
              className={`rounded px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : "border"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
