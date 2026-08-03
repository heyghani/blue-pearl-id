"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/require-admin";
import { updateDefaultBasePrice } from "@/lib/services/admin/store-settings.service";
import { defaultBasePriceSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
  defaultBasePrice?: number;
};

export async function updateDefaultBasePriceAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = defaultBasePriceSchema.safeParse({
    defaultBasePrice: formData.get("defaultBasePrice"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const settings = await updateDefaultBasePrice(parsed.data.defaultBasePrice);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/products/new");

  return {
    success: "Default base price updated.",
    defaultBasePrice: Number(settings.defaultBasePrice),
  };
}
