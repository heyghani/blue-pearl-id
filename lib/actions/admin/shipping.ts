"use server";

import { ShippingMethodType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/require-admin";
import { formatAdminError } from "@/lib/actions/admin/prisma-error";
import { rethrowIfRedirect } from "@/lib/actions/admin/redirect-error";
import {
  createShippingQuantityTier,
  deleteShippingQuantityTier,
  updateShippingQuantityTier,
  updateShippingRate,
} from "@/lib/services/admin/shipping.service";
import {
  shippingQuantityTierSchema,
  shippingRateSchema,
} from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

function revalidateShippingPaths() {
  revalidatePath("/admin/shipping");
  revalidatePath("/checkout/shipping");
  revalidatePath("/products", "layout");
  revalidatePath("/cart");
}

function parseTierForm(formData: FormData) {
  return shippingQuantityTierSchema.safeParse({
    quantity: formData.get("quantity"),
    standardPrice: formData.get("standardPrice"),
    expressPrice: formData.get("expressPrice"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function updateShippingRateAction(
  method: ShippingMethodType,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const min = formData.get("estimatedDaysMin");
  const max = formData.get("estimatedDaysMax");

  const parsed = shippingRateSchema.safeParse({
    price: formData.get("price"),
    estimatedDaysMin: min === "" || min === null ? undefined : min,
    estimatedDaysMax: max === "" || max === null ? undefined : max,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await updateShippingRate(method, {
    price: data.price,
    estimatedDaysMin:
      typeof data.estimatedDaysMin === "number" ? data.estimatedDaysMin : null,
    estimatedDaysMax:
      typeof data.estimatedDaysMax === "number" ? data.estimatedDaysMax : null,
    isActive: data.isActive,
  });

  revalidateShippingPaths();
  return { success: "Shipping rate updated." };
}

export async function createShippingQuantityTierAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseTierForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createShippingQuantityTier(parsed.data);
  } catch (error) {
    return {
      error: formatAdminError(error, "Could not add this quantity pack."),
    };
  }

  revalidateShippingPaths();
  return { success: "Quantity pack added." };
}

export async function updateShippingQuantityTierAction(
  id: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = parseTierForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateShippingQuantityTier(id, parsed.data);
  } catch (error) {
    return {
      error: formatAdminError(error, "Could not update this quantity pack."),
    };
  }

  revalidateShippingPaths();
  return { success: "Quantity pack updated." };
}

export async function deleteShippingQuantityTierAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await deleteShippingQuantityTier(id);
    revalidateShippingPaths();
  } catch (error) {
    rethrowIfRedirect(error);
    const message = formatAdminError(error, "Could not remove this quantity pack.");
    redirect(`/admin/shipping?error=${encodeURIComponent(message)}`);
  }
}
