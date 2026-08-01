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
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ProductStatusToggle } from "@/components/admin/product-status-toggle";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminListHref } from "@/lib/admin/list-query";
import { listAdminBrands } from "@/lib/services/admin/brand.service";
import { listAdminCategories } from "@/lib/services/admin/category.service";
import { listAdminProducts } from "@/lib/services/admin/product.service";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    status?: string;
    featured?: string;
    stock?: string;
    category?: string;
    brand?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status =
    params.status === "active" || params.status === "hidden"
      ? params.status
      : undefined;
  const featured = params.featured === "1" || params.featured === "true";
  const stock = params.stock === "low" ? "low" : undefined;
  const categoryId = params.category || undefined;
  const brandId = params.brand || undefined;

  const query = {
    search: params.search,
    status,
    featured: featured ? "1" : undefined,
    stock,
    category: categoryId,
    brand: brandId,
  };

  const hasFilters = Boolean(
    params.search || status || featured || stock || categoryId || brandId,
  );

  const [{ products, total, totalPages }, categories, brands] =
    await Promise.all([
      listAdminProducts({
        search: params.search,
        page,
        limit: PAGE_SIZE,
        status,
        featured: featured || undefined,
        stock,
        categoryId,
        brandId,
      }),
      listAdminCategories(),
      listAdminBrands(),
    ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Manage catalog, pricing, and inventory."
        meta={`${total} product${total === 1 ? "" : "s"}`}
        action={
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        }
      />

      <AdminListToolbar
        searchDefault={params.search ?? ""}
        searchPlaceholder="Search by name, SKU, brand, category…"
        clearHref="/admin/products"
        hasFilters={hasFilters}
        hiddenFields={{
          status,
          featured: featured ? "1" : undefined,
          stock,
          category: categoryId,
          brand: brandId,
        }}
        filters={
          <div className="space-y-2">
            <AdminFilterChips>
              <AdminFilterChip
                href={adminListHref("/admin/products", query, {
                  status: undefined,
                  featured: undefined,
                  stock: undefined,
                  page: undefined,
                })}
                active={!status && !featured && !stock}
              >
                All
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref("/admin/products", query, {
                  status: "active",
                  page: undefined,
                })}
                active={status === "active"}
              >
                Active
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref("/admin/products", query, {
                  status: "hidden",
                  page: undefined,
                })}
                active={status === "hidden"}
              >
                Hidden
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref("/admin/products", query, {
                  featured: featured ? undefined : "1",
                  page: undefined,
                })}
                active={featured}
              >
                Featured
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref("/admin/products", query, {
                  stock: stock === "low" ? undefined : "low",
                  page: undefined,
                })}
                active={stock === "low"}
              >
                Low stock
              </AdminFilterChip>
            </AdminFilterChips>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                defaultValue={categoryId ?? ""}
                aria-label="Filter by category"
                name="category"
                form="products-taxonomy-filter"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.parent
                      ? `${category.parent.name} / ${category.name}`
                      : category.name}
                  </option>
                ))}
              </select>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                defaultValue={brandId ?? ""}
                aria-label="Filter by brand"
                name="brand"
                form="products-taxonomy-filter"
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <form
                id="products-taxonomy-filter"
                method="get"
                className="contents"
              >
                {params.search ? (
                  <input type="hidden" name="search" value={params.search} />
                ) : null}
                {status ? <input type="hidden" name="status" value={status} /> : null}
                {featured ? <input type="hidden" name="featured" value="1" /> : null}
                {stock ? <input type="hidden" name="stock" value={stock} /> : null}
                <Button type="submit" size="sm" variant="secondary" className="h-8">
                  Apply
                </Button>
              </form>
            </div>
          </div>
        }
      />

      <AdminDataTable
        empty={
          products.length === 0 ? (
            hasFilters ? (
              <AdminEmptyState
                title="No products match"
                description="Try clearing filters or adjusting your search."
                actionLabel="Clear filters"
                actionHref="/admin/products"
              />
            ) : (
              <AdminEmptyState
                title="No products yet"
                description="Add your first product to start selling."
                actionLabel="Add product"
                actionHref="/admin/products/new"
              />
            )
          ) : undefined
        }
      >
        <AdminTableHead>
          <tr>
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </AdminTableHead>
        <tbody className="divide-y">
          {products.map((product) => {
            const isLowStock =
              product.inventory?.trackInventory &&
              product.inventory.quantity <= product.inventory.lowStockThreshold;

            return (
              <tr key={product.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-3 font-medium hover:underline"
                  >
                    {product.images[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded bg-muted" />
                    )}
                    <span className="line-clamp-2">{product.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.brand?.name ?? "—"}
                </td>
                <td className="max-w-[10rem] truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                  {product.sku}
                </td>
                <td className="px-4 py-3">
                  <Price amount={product.price.toString()} />
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <div className="space-y-0.5">
                    <span className={isLowStock ? "text-amber-700" : undefined}>
                      {product.inventory?.quantity ?? 0}
                    </span>
                    {product.hasVariants ? (
                      <p className="text-xs text-muted-foreground">
                        {product.variants.length} variant
                        {product.variants.length === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                    <ProductStatusToggle
                      productId={product.id}
                      isActive={product.isActive}
                    />
                    {product.isFeatured ? (
                      <Badge variant="outline">Featured</Badge>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </AdminDataTable>

      <AdminPagination
        pathname="/admin/products"
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </div>
  );
}
