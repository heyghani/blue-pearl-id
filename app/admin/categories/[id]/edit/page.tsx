import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { deleteCategoryAction } from "@/lib/actions/admin/categories";
import {
  getAdminCategory,
  listAdminParentCategories,
} from "@/lib/services/admin/category.service";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditCategoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const [category, parentCategories] = await Promise.all([
    getAdminCategory(id),
    listAdminParentCategories(id),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit category</h1>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Back</Link>
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <CategoryForm
        categoryId={category.id}
        parentCategories={parentCategories}
        defaults={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          parentId: category.parentId,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
      />

      {category._count.products === 0 && category.children.length === 0 ? (
        <ConfirmDeleteForm
          action={deleteCategoryAction.bind(null, category.id)}
          label="Delete category"
          confirmMessage={`Delete "${category.name}"? This cannot be undone.`}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Reassign products and remove sub-categories before deleting this category.
        </p>
      )}
    </div>
  );
}
