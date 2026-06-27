import Image from "next/image";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { toggleBrandActiveAction } from "@/lib/actions/admin/brands";
import { listAdminBrands } from "@/lib/services/admin/brand.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminBrandsPage() {
  const brands = await listAdminBrands();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Brands"
        description="Manage product brands shown in the catalog and on product pages."
        action={
          <Button asChild>
            <Link href="/admin/brands/new">Add brand</Link>
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="font-medium">No brands yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add brands like Nike, Adidas, or your house label.
                  </p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/admin/brands/new">Add brand</Link>
                  </Button>
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
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
                  <td className="px-4 py-3">{brand._count.products}</td>
                  <td className="px-4 py-3">
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/brands/${brand.id}/edit`}>Edit</Link>
                      </Button>
                      <form action={toggleBrandActiveAction.bind(null, brand.id, !brand.isActive)}>
                        <Button type="submit" variant="ghost" size="sm">
                          {brand.isActive ? "Hide" : "Show"}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
