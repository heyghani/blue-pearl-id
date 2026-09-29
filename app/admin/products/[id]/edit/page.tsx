import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Button } from "@/components/ui/button";
import { adminVariantsToFormState } from "@/lib/products/variants";
import { getAdminProduct } from "@/lib/services/admin/product.service";
import { listCategoriesForProductForm } from "@/lib/services/admin/category.service";
import { listBrandsForProductForm } from "@/lib/services/admin/brand.service";
import { deleteProductAction } from "@/lib/actions/admin/products";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  if (product.isHalloween) {
    redirect(`/admin/halloween/${id}/edit`);
  }

  const [categories, brands] = await Promise.all([
    listCategoriesForProductForm(product.categoryId),
    listBrandsForProductForm(product.brandId),
  ]);

  const variantState = adminVariantsToFormState(product.options, product.variants);
  const media = product.images.map((image) => ({
    url: image.url,
    type: image.mediaType === "VIDEO" ? ("video" as const) : ("image" as const),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/products/${product.slug}`} target="_blank">
              View on store
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/products">Back</Link>
          </Button>
        </div>
      </div>

      <ProductForm
        catalog="main"
        productId={product.id}
        categories={categories}
        brands={brands}
        defaults={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? null,
          categoryId: product.categoryId,
          brandId: product.brandId,
          tags: product.tags,
          shortDescription: product.shortDescription,
          description: product.description,
          media,
          quantity: product.inventory?.quantity ?? 0,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          hasVariants: variantState.hasVariants,
          options: variantState.options,
          variants: variantState.variants,
        }}
      />

      <ConfirmDeleteForm
        action={deleteProductAction}
        id={product.id}
        label="Delete product"
        confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
      />
    </div>
  );
}
