"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/require-admin";
import { formatAdminError } from "@/lib/actions/admin/prisma-error";
import { rethrowIfRedirect } from "@/lib/actions/admin/redirect-error";
import {
  createBrand,
  deleteBrand,
  setBrandActive,
  updateBrand,
} from "@/lib/services/admin/brand.service";
import { brandFormSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseBrandForm(formData: FormData) {
  return brandFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    logoUrl: formData.get("logoUrl") || undefined,
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder"),
    isActive: parseCheckbox(formData.get("isActive")),
  });
}

function revalidateBrandPaths() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/brands");
}

export async function createBrandAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    const brand = await createBrand({
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl || null,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    revalidateBrandPaths();
    redirect(`/admin/brands/${brand.id}/edit`);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: formatAdminError(error, "Could not create brand."),
    };
  }
}

export async function updateBrandAction(
  brandId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  try {
    await updateBrand(brandId, {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl || null,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    revalidateBrandPaths();
    revalidatePath(`/admin/brands/${brandId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      error: formatAdminError(error, "Could not update brand."),
    };
  }
}

export async function deleteBrandAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const brandId = formData.get("id");
  if (typeof brandId !== "string" || !brandId) return;

  try {
    await deleteBrand(brandId);
    revalidateBrandPaths();
    redirect("/admin/brands");
  } catch (error) {
    rethrowIfRedirect(error);
    redirect(
      `/admin/brands/${brandId}/edit?error=${encodeURIComponent(formatAdminError(error, "Could not delete brand."))}`,
    );
  }
}

export async function toggleBrandActiveAction(
  brandId: string,
  nextActive: boolean,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  await setBrandActive(brandId, nextActive);
  revalidateBrandPaths();
  revalidatePath(`/admin/brands/${brandId}/edit`);
}
