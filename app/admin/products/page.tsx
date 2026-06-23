import Image from "next/image";
import Link from "next/link";

import { ProductStatusToggle } from "@/components/admin/product-status-toggle";
import { listAdminProducts } from "@/lib/services/admin/product.service";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { products, totalPages } = await listAdminProducts({
    search: params.search,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage catalog and inventory.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>

      <form className="max-w-md">
        <input
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search products…"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
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
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    )}
                    <span>{product.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{product.sku}</td>
                <td className="px-4 py-3">
                  <Price amount={product.price.toString()} />
                </td>
                <td className="px-4 py-3">
                  {product.hasVariants ? (
                    <div className="space-y-1">
                      <span>{product.inventory?.quantity ?? 0}</span>
                      <p className="text-xs text-muted-foreground">
                        {product.variants.length} variant
                        {product.variants.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  ) : (
                    product.inventory?.quantity ?? 0
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                    <ProductStatusToggle
                      productId={product.id}
                      isActive={product.isActive}
                    />
                    {product.hasVariants ? (
                      <Badge variant="outline">Variants</Badge>
                    ) : null}
                    {product.isFeatured && <Badge variant="outline">Featured</Badge>}
                  </div>
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
              href={`/admin/products?page=${p}${params.search ? `&search=${params.search}` : ""}`}
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
