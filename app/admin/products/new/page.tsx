import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { listCategoriesForProductForm } from "@/lib/services/admin/category.service";
import { listBrandsForProductForm } from "@/lib/services/admin/brand.service";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    listCategoriesForProductForm(),
    listBrandsForProductForm(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
          <p className="text-muted-foreground">Add a product to the catalog.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to products</Link>
        </Button>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
