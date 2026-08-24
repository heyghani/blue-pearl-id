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

export type AdminProductCatalog = "main" | "halloween";

const CATALOG_CONFIG = {
  main: {
    basePath: "/admin/products",
    title: "Products",
    description: "Manage catalog, pricing, and inventory.",
    emptyTitle: "No products yet",
    emptyDescription: "Add your first product to start selling.",
    addLabel: "Add product",
  },
  halloween: {
    basePath: "/admin/halloween",
    title: "Halloween",
    description: "Manage Halloween catalog products separately from the main shop.",
    emptyTitle: "No Halloween products yet",
    emptyDescription: "Add your first Halloween product to this catalog.",
    addLabel: "Add product",
  },
} as const;

export async function AdminProductListPage({
  catalog,
  searchParams,
}: {
  catalog: AdminProductCatalog;
  searchParams: {
    search?: string;
    page?: string;
    status?: string;
    featured?: string;
    stock?: string;
    category?: string;
    brand?: string;
  };
}) {
  const config = CATALOG_CONFIG[catalog];
  const halloween = catalog === "halloween";
  const page = Number(searchParams.page) || 1;
  const status =
    searchParams.status === "active" || searchParams.status === "hidden"
      ? searchParams.status
      : undefined;
  const featured =
    searchParams.featured === "1" || searchParams.featured === "true";
  const stock = searchParams.stock === "low" ? "low" : undefined;
  const categoryId = searchParams.category || undefined;
  const brandId = searchParams.brand || undefined;

  const query = {
    search: searchParams.search,
    status,
    featured: featured ? "1" : undefined,
    stock,
    category: categoryId,
    brand: brandId,
  };

  const hasFilters = Boolean(
    searchParams.search || status || featured || stock || categoryId || brandId,
  );

  const [{ products, total, totalPages }, categories, brands] =
    await Promise.all([
      listAdminProducts({
        search: searchParams.search,
        page,
        limit: PAGE_SIZE,
        status,
        featured: featured || undefined,
        halloween,
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
        title={config.title}
        description={config.description}
        meta={`${total} product${total === 1 ? "" : "s"}`}
        action={
          <Button asChild>
            <Link href={`${config.basePath}/new`}>{config.addLabel}</Link>
          </Button>
        }
      />

      <AdminListToolbar
        searchDefault={searchParams.search ?? ""}
        searchPlaceholder="Search by name, SKU, brand, category…"
        clearHref={config.basePath}
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
                href={adminListHref(config.basePath, query, {
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
                href={adminListHref(config.basePath, query, {
                  status: "active",
                  page: undefined,
                })}
                active={status === "active"}
              >
                Active
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref(config.basePath, query, {
                  status: "hidden",
                  page: undefined,
                })}
                active={status === "hidden"}
              >
                Hidden
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref(config.basePath, query, {
                  featured: featured ? undefined : "1",
                  page: undefined,
                })}
                active={featured}
              >
                Featured
              </AdminFilterChip>
              <AdminFilterChip
                href={adminListHref(config.basePath, query, {
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
                {searchParams.search ? (
                  <input type="hidden" name="search" value={searchParams.search} />
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
                actionHref={config.basePath}
              />
            ) : (
              <AdminEmptyState
                title={config.emptyTitle}
                description={config.emptyDescription}
                actionLabel={config.addLabel}
                actionHref={`${config.basePath}/new`}
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
                    href={`${config.basePath}/${product.id}/edit`}
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
        pathname={config.basePath}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </div>
  );
}
