"use server";

import { ShippingMethodType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/require-admin";
import { updateShippingRate } from "@/lib/services/admin/shipping.service";
import { shippingRateSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

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

  revalidatePath("/admin/shipping");
  revalidatePath("/checkout/shipping");
  return { success: "Shipping rate updated." };
}
