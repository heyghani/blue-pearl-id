import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { toggleCategoryActiveAction } from "@/lib/actions/admin/categories";
import { listAdminCategories } from "@/lib/services/admin/category.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();
  const roots = categories.filter((category) => !category.parentId);
  const childrenByParent = new Map<string, typeof categories>();

  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage top-level and sub-categories for the storefront catalog."
        action={
          <Button asChild>
            <Link href="/admin/categories/new">Add category</Link>
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="font-medium">No categories yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create categories like Shoes, Sandals, or sub-types like Mesh, Cotton.
                  </p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/admin/categories/new">Add category</Link>
                  </Button>
                </td>
              </tr>
            ) : (
              roots.flatMap((root) => {
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
                    <td className="px-4 py-3">{root._count.products}</td>
                    <td className="px-4 py-3">
                      <Badge variant={root.isActive ? "default" : "secondary"}>
                        {root.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/categories/${root.id}/edit`}>Edit</Link>
                        </Button>
                        <form action={toggleCategoryActiveAction.bind(null, root.id, !root.isActive)}>
                          <Button type="submit" variant="ghost" size="sm">
                            {root.isActive ? "Hide" : "Show"}
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>,
                ];

                for (const child of children) {
                  rows.push(
                    <tr key={child.id} className="hover:bg-muted/30 bg-muted/10">
                      <td className="px-4 py-3 pl-8">
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
                      <td className="px-4 py-3">{child._count.products}</td>
                      <td className="px-4 py-3">
                        <Badge variant={child.isActive ? "default" : "secondary"}>
                          {child.isActive ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/categories/${child.id}/edit`}>Edit</Link>
                          </Button>
                          <form
                            action={toggleCategoryActiveAction.bind(null, child.id, !child.isActive)}
                          >
                            <Button type="submit" variant="ghost" size="sm">
                              {child.isActive ? "Hide" : "Show"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>,
                  );
                }

                return rows;
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
