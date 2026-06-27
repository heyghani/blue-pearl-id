"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/require-admin";
import { formatAdminError } from "@/lib/actions/admin/prisma-error";
import { rethrowIfRedirect } from "@/lib/actions/admin/redirect-error";
import {
  createCategory,
  deleteCategory,
  setCategoryActive,
  updateCategory,
} from "@/lib/services/admin/category.service";
import { categoryFormSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseCategoryForm(formData: FormData) {
  const parentId = formData.get("parentId");

  return categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    parentId: parentId === "" || parentId === null ? undefined : parentId,
    sortOrder: formData.get("sortOrder"),
    isActive: parseCheckbox(formData.get("isActive")),
  });
}

function revalidateCategoryPaths() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

export async function createCategoryAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    const category = await createCategory({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    revalidateCategoryPaths();
    redirect(`/admin/categories/${category.id}/edit`);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: formatAdminError(error, "Could not create category."),
    };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  if (data.parentId === categoryId) {
    return { error: "A category cannot be its own parent." };
  }

  try {
    await updateCategory(categoryId, {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    revalidateCategoryPaths();
    revalidatePath(`/admin/categories/${categoryId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      error: formatAdminError(error, "Could not update category."),
    };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  try {
    await deleteCategory(categoryId);
    revalidateCategoryPaths();
    redirect("/admin/categories");
  } catch (error) {
    rethrowIfRedirect(error);
    const message = formatAdminError(error, "Could not delete category.");
    redirect(
      `/admin/categories/${categoryId}/edit?error=${encodeURIComponent(message)}`,
    );
  }
}

export async function toggleCategoryActiveAction(
  categoryId: string,
  nextActive: boolean,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  await setCategoryActive(categoryId, nextActive);
  revalidateCategoryPaths();
  revalidatePath(`/admin/categories/${categoryId}/edit`);
}
