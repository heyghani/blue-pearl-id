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
import { toggleCategoryActiveAction } from "@/lib/actions/admin/categories";
import { adminListHref } from "@/lib/admin/list-query";
import { listAdminCategories } from "@/lib/services/admin/category.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage({
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

  const categories = await listAdminCategories({
    search: params.search,
    active: activeFilter,
  });
  const roots = categories.filter((category) => !category.parentId);
  const childrenByParent = new Map<string, typeof categories>();
  const rootIds = new Set(roots.map((root) => root.id));

  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  // Orphaned children (parent filtered out) still appear as nested rows.
  const orphanChildren = categories.filter(
    (category) => category.parentId && !rootIds.has(category.parentId),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage top-level and sub-categories for the storefront catalog."
        meta={`${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
        action={
          <Button asChild>
            <Link href="/admin/categories/new">Add category</Link>
          </Button>
        }
      />

      <AdminListToolbar
        searchDefault={params.search ?? ""}
        searchPlaceholder="Search categories…"
        clearHref="/admin/categories"
        hasFilters={hasFilters}
        hiddenFields={{ active: params.active }}
        filters={
          <AdminFilterChips>
            <AdminFilterChip
              href={adminListHref("/admin/categories", query, {
                active: undefined,
              })}
              active={params.active == null}
            >
              All
            </AdminFilterChip>
            <AdminFilterChip
              href={adminListHref("/admin/categories", query, { active: "1" })}
              active={params.active === "1"}
            >
              Active
            </AdminFilterChip>
            <AdminFilterChip
              href={adminListHref("/admin/categories", query, { active: "0" })}
              active={params.active === "0"}
            >
              Hidden
            </AdminFilterChip>
          </AdminFilterChips>
        }
      />

      <AdminDataTable
        empty={
          categories.length === 0 ? (
            hasFilters ? (
              <AdminEmptyState
                title="No categories match"
                description="Try clearing filters or adjusting your search."
                actionLabel="Clear filters"
                actionHref="/admin/categories"
              />
            ) : (
              <AdminEmptyState
                title="No categories yet"
                description="Create categories like Shoes, Sandals, or sub-types like Mesh, Cotton."
                actionLabel="Add category"
                actionHref="/admin/categories/new"
              />
            )
          ) : undefined
        }
      >
        <AdminTableHead>
          <tr>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Products</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Visibility</th>
          </tr>
        </AdminTableHead>
        <tbody className="divide-y">
          {roots.flatMap((root) => {
            const children = childrenByParent.get(root.id) ?? [];
            const rows = [
              <tr key={root.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/categories/${root.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {root.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Top-level</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{root.slug}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products?category=${root.id}`}
                    className="tabular-nums hover:underline"
                  >
                    {root._count.products}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={root.isActive ? "default" : "secondary"}>
                    {root.isActive ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <form
                    action={toggleCategoryActiveAction.bind(
                      null,
                      root.id,
                      !root.isActive,
                    )}
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      {root.isActive ? "Hide" : "Show"}
                    </Button>
                  </form>
                </td>
              </tr>,
            ];

            for (const child of children) {
              rows.push(
                <tr key={child.id} className="hover:bg-muted/30">
                  <td className="border-l-2 border-muted-foreground/25 px-4 py-3 pl-8">
                    <Link
                      href={`/admin/categories/${child.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {child.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Sub-category of {root.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{child.slug}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products?category=${child.id}`}
                      className="tabular-nums hover:underline"
                    >
                      {child._count.products}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={child.isActive ? "default" : "secondary"}>
                      {child.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={toggleCategoryActiveAction.bind(
                        null,
                        child.id,
                        !child.isActive,
                      )}
                    >
                      <Button type="submit" variant="ghost" size="sm">
                        {child.isActive ? "Hide" : "Show"}
                      </Button>
                    </form>
                  </td>
                </tr>,
              );
            }

            return rows;
          })}
          {orphanChildren.map((child) => (
            <tr key={child.id} className="hover:bg-muted/30">
              <td className="border-l-2 border-muted-foreground/25 px-4 py-3 pl-8">
                <Link
                  href={`/admin/categories/${child.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {child.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Sub-category
                  {child.parent ? ` of ${child.parent.name}` : ""}
                </p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{child.slug}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/products?category=${child.id}`}
                  className="tabular-nums hover:underline"
                >
                  {child._count.products}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge variant={child.isActive ? "default" : "secondary"}>
                  {child.isActive ? "Active" : "Hidden"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <form
                  action={toggleCategoryActiveAction.bind(
                    null,
                    child.id,
                    !child.isActive,
                  )}
                >
                  <Button type="submit" variant="ghost" size="sm">
                    {child.isActive ? "Hide" : "Show"}
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
