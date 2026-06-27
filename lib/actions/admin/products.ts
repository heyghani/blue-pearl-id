"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/require-admin";
import { formatAdminError } from "@/lib/actions/admin/prisma-error";
import { rethrowIfRedirect } from "@/lib/actions/admin/redirect-error";
import { parseVariantsPayload } from "@/lib/products/variants";
import {
  createProduct,
  deleteProduct,
  setProductActive,
  updateProduct,
} from "@/lib/services/admin/product.service";
import { productFormSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

type ProductFormData = z.infer<typeof productFormSchema>;

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseProductForm(formData: FormData) {
  const compareAt = formData.get("compareAtPrice");
  const categoryId = formData.get("categoryId");
  const brandId = formData.get("brandId");
  const tagsRaw = formData.get("tags");

  const tags =
    typeof tagsRaw === "string"
      ? tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

  return productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    price: formData.get("price"),
    compareAtPrice: compareAt === "" || compareAt === null ? undefined : compareAt,
    categoryId: categoryId === "" || categoryId === null ? undefined : categoryId,
    brandId: brandId === "" || brandId === null ? undefined : brandId,
    tags: tags.length > 0 ? tags.join(", ") : undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    quantity: formData.get("quantity"),
    isActive: parseCheckbox(formData.get("isActive")),
    isFeatured: parseCheckbox(formData.get("isFeatured")),
    hasVariants: parseCheckbox(formData.get("hasVariants")),
    variantsPayload: formData.get("variantsPayload") || undefined,
  });
}

function revalidateProductPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");

  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

function buildVariantInput(data: ProductFormData) {
  if (!data.hasVariants) {
    return { hasVariants: false, options: [], variants: [] };
  }

  let parsedPayload: unknown = null;
  try {
    parsedPayload = data.variantsPayload ? JSON.parse(data.variantsPayload) : null;
  } catch {
    return { hasVariants: false, options: [], variants: [] };
  }

  return parseVariantsPayload({ hasVariants: true, ...(parsedPayload as object) });
}

function parseTags(tags?: string) {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createProductAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const variantData = buildVariantInput(data);

  try {
    const product = await createProduct({
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      price: data.price,
      compareAtPrice:
        typeof data.compareAtPrice === "number" ? data.compareAtPrice : null,
      categoryId: data.categoryId ?? null,
      brandId: data.brandId ?? null,
      tags: parseTags(data.tags),
      shortDescription: data.shortDescription ?? null,
      description: data.description ?? null,
      imageUrl: data.imageUrl || null,
      quantity: data.quantity,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      hasVariants: variantData.hasVariants,
      options: variantData.options,
      variants: variantData.variants,
    });

    revalidateProductPaths();
    redirect(`/admin/products/${product.id}/edit`);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: formatAdminError(error, "Could not create product."),
    };
  }
}

export async function updateProductAction(
  productId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const variantData = buildVariantInput(data);

  try {
    await updateProduct(productId, {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      price: data.price,
      compareAtPrice:
        typeof data.compareAtPrice === "number" ? data.compareAtPrice : null,
      categoryId: data.categoryId ?? null,
      brandId: data.brandId ?? null,
      tags: parseTags(data.tags),
      shortDescription: data.shortDescription ?? null,
      description: data.description ?? null,
      imageUrl: data.imageUrl || null,
      quantity: data.quantity,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      hasVariants: variantData.hasVariants,
      options: variantData.options,
      variants: variantData.variants,
    });

    revalidateProductPaths(data.slug);
    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch (error) {
    return {
      error: formatAdminError(error, "Could not update product."),
    };
  }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const productId = formData.get("id");
  if (typeof productId !== "string" || !productId) return;

  try {
    await deleteProduct(productId);
    revalidateProductPaths();
    redirect("/admin/products");
  } catch (error) {
    rethrowIfRedirect(error);
    redirect(
      `/admin/products/${productId}/edit?error=${encodeURIComponent(formatAdminError(error, "Could not delete product."))}`,
    );
  }
}

export async function toggleProductActiveAction(
  productId: string,
  nextActive: boolean,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const product = await setProductActive(productId, nextActive);
  revalidateProductPaths(product.slug);
  revalidatePath(`/admin/products/${productId}/edit`);
}
