import Link from "next/link";

import {
  AdminDataTable,
  AdminTableHead,
} from "@/components/admin/admin-data-table";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { listCustomers } from "@/lib/services/admin/customer.service";

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const hasFilters = Boolean(params.search);
  const { customers, total, totalPages } = await listCustomers({
    search: params.search,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Registered customer accounts and order history."
        meta={`${total} customer${total === 1 ? "" : "s"}`}
      />

      <AdminListToolbar
        searchDefault={params.search ?? ""}
        searchPlaceholder="Search by name or email…"
        clearHref="/admin/customers"
        hasFilters={hasFilters}
      />

      <AdminDataTable
        minWidthClassName="min-w-[720px]"
        empty={
          customers.length === 0 ? (
            hasFilters ? (
              <AdminEmptyState
                title="No customers match"
                description="Try a different name or email."
                actionLabel="Clear search"
                actionHref="/admin/customers"
              />
            ) : (
              <AdminEmptyState
                title="No customers yet"
                description="Registered shoppers will appear here."
              />
            )
          ) : undefined
        }
      >
        <AdminTableHead>
          <tr>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Orders</th>
            <th className="px-4 py-3 font-medium">Last order</th>
            <th className="px-4 py-3 font-medium">Joined</th>
          </tr>
        </AdminTableHead>
        <tbody className="divide-y">
          {customers.map((customer) => {
            const lastOrderAt = customer.orders[0]?.createdAt;
            return (
              <tr key={customer.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-medium hover:underline"
                  >
                    {customer.name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {customer.email}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {customer._count.orders}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lastOrderAt ? lastOrderAt.toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {customer.createdAt.toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </AdminDataTable>

      <AdminPagination
        pathname="/admin/customers"
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        query={{ search: params.search }}
      />
    </div>
  );
}
