import Link from "next/link";

import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui/button";
import { listAdminParentCategories } from "@/lib/services/admin/category.service";

export default async function NewCategoryPage() {
  const parentCategories = await listAdminParentCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New category</h1>
          <p className="text-muted-foreground">
            Add a top-level category or sub-category for catalog navigation.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Back to categories</Link>
        </Button>
      </div>

      <CategoryForm parentCategories={parentCategories} />
    </div>
  );
}
