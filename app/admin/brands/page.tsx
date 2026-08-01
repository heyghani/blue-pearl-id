import Image from "next/image";
import Link from "next/link";

import {
  AdminDataTable,
  AdminTableHead,
} from "@/components/admin/admin-data-table";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import {
  AdminFilterChip,
  AdminFilterChips,
  AdminListToolbar,
} from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { toggleBrandActiveAction } from "@/lib/actions/admin/brands";
import { adminListHref } from "@/lib/admin/list-query";
import { listAdminBrands } from "@/lib/services/admin/brand.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; active?: string }>;
}) {
  const params = await searchParams;
  const activeFilter =
    params.active === "1"
      ? true
      : params.active === "0"
        ? false
        : undefined;
  const hasFilters = Boolean(params.search || params.active);
  const query = {
    search: params.search,
    active: params.active,
  };

  const brands = await listAdminBrands({
    search: params.search,
    active: activeFilter,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Brands"
        description="Manage product brands shown in the catalog and on product pages."
        meta={`${brands.length} brand${brands.length === 1 ? "" : "s"}`}
        action={
          <Button asChild>
            <Link href="/admin/brands/new">Add brand</Link>
          </Button>
        }
      />

      <AdminListToolbar
        searchDefault={params.search ?? ""}
        searchPlaceholder="Search brands…"
        clearHref="/admin/brands"
        hasFilters={hasFilters}
        hiddenFields={{ active: params.active }}
        filters={
          <AdminFilterChips>
            <AdminFilterChip
              href={adminListHref("/admin/brands", query, { active: undefined })}
              active={params.active == null}
            >
              All
            </AdminFilterChip>
            <AdminFilterChip
              href={adminListHref("/admin/brands", query, { active: "1" })}
              active={params.active === "1"}
            >
              Active
            </AdminFilterChip>
            <AdminFilterChip
              href={adminListHref("/admin/brands", query, { active: "0" })}
              active={params.active === "0"}
            >
              Hidden
            </AdminFilterChip>
          </AdminFilterChips>
        }
      />

      <AdminDataTable
        minWidthClassName="min-w-[640px]"
        empty={
          brands.length === 0 ? (
            hasFilters ? (
              <AdminEmptyState
                title="No brands match"
                description="Try clearing filters or adjusting your search."
                actionLabel="Clear filters"
                actionHref="/admin/brands"
              />
            ) : (
              <AdminEmptyState
                title="No brands yet"
                description="Add brands like Nike, Adidas, or your house label."
                actionLabel="Add brand"
                actionHref="/admin/brands/new"
              />
            )
          ) : undefined
        }
      >
        <AdminTableHead>
          <tr>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Products</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Visibility</th>
          </tr>
        </AdminTableHead>
        <tbody className="divide-y">
          {brands.map((brand) => (
            <tr key={brand.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/brands/${brand.id}/edit`}
                  className="flex items-center gap-3 font-medium hover:underline"
                >
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      width={32}
                      height={32}
                      className="rounded object-contain"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-semibold">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {brand.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{brand.slug}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/products?brand=${brand.id}`}
                  className="tabular-nums hover:underline"
                >
                  {brand._count.products}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge variant={brand.isActive ? "default" : "secondary"}>
                  {brand.isActive ? "Active" : "Hidden"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <form
                  action={toggleBrandActiveAction.bind(
                    null,
                    brand.id,
                    !brand.isActive,
                  )}
                >
                  <Button type="submit" variant="ghost" size="sm">
                    {brand.isActive ? "Hide" : "Show"}
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminDataTable>
    </div>
  );
}
