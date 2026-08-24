import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { listCategoriesForProductForm } from "@/lib/services/admin/category.service";
import { listBrandsForProductForm } from "@/lib/services/admin/brand.service";
import { getDefaultBasePrice } from "@/lib/services/admin/store-settings.service";

export default async function NewHalloweenProductPage() {
  const [categories, brands, defaultBasePrice] = await Promise.all([
    listCategoriesForProductForm(),
    listBrandsForProductForm(),
    getDefaultBasePrice(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            New Halloween product
          </h1>
          <p className="text-muted-foreground">
            Add a product to the Halloween catalog.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/halloween">Back to Halloween</Link>
        </Button>
      </div>

      <ProductForm
        catalog="halloween"
        categories={categories}
        brands={brands}
        defaults={{ price: String(defaultBasePrice) }}
      />
    </div>
  );
}
