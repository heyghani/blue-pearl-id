import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import {
  getAdminProduct,
  listAdminCategories,
} from "@/lib/services/admin/product.service";
import { deleteProductAction } from "@/lib/actions/admin/products";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

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
        productId={product.id}
        categories={categories}
        defaults={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price.toString(),
          compareAtPrice: product.compareAtPrice?.toString() ?? null,
          categoryId: product.categoryId,
          shortDescription: product.shortDescription,
          description: product.description,
          imageUrl: primaryImage?.url ?? null,
          quantity: product.inventory?.quantity ?? 0,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }}
      />

      <form action={deleteProductAction.bind(null, product.id)}>
        <Button type="submit" variant="destructive" size="sm">
          Delete product
        </Button>
      </form>
    </div>
  );
}
