import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandForm } from "@/components/admin/brand-form";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Button } from "@/components/ui/button";
import { deleteBrandAction } from "@/lib/actions/admin/brands";
import { getAdminBrand } from "@/lib/services/admin/brand.service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;
  const brand = await getAdminBrand(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit brand</h1>
          <p className="text-muted-foreground">{brand.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/brands">Back</Link>
        </Button>
      </div>

      <BrandForm
        brandId={brand.id}
        defaults={{
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl,
          description: brand.description,
          sortOrder: brand.sortOrder,
          isActive: brand.isActive,
        }}
      />

      {brand._count.products === 0 ? (
        <ConfirmDeleteForm
          action={deleteBrandAction}
          id={brand.id}
          label="Delete brand"
          confirmMessage={`Delete "${brand.name}"? This cannot be undone.`}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Reassign products before deleting this brand.
        </p>
      )}
    </div>
  );
}
