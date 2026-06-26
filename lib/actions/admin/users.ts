"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  changeAdminPassword,
  createAdminUser,
  removeAdminUser,
  resetAdminPassword,
} from "@/lib/services/admin/user.service";
import {
  changePasswordSchema,
  createAdminUserSchema,
  resetAdminPasswordSchema,
} from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

function validationError(
  fieldErrors: Record<string, string[]>,
): AdminActionState {
  return { fieldErrors };
}

export async function createAdminUserAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = createAdminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    await createAdminUser(parsed.data);
  } catch {
    return { error: "Could not create admin account. Please try again." };
  }

  revalidatePath("/admin/settings");
  return { success: "Admin account created successfully." };
}

export async function changePasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin?.id) return { error: "Unauthorized." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const result = await changeAdminPassword({
    userId: admin.id,
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.password,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/settings");
  return { success: "Your password has been updated." };
}

export async function resetAdminPasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin?.id) return { error: "Unauthorized." };

  const parsed = resetAdminPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  if (parsed.data.userId === admin.id) {
    return {
      error: "Use the password form below to change your own password.",
    };
  }

  const result = await resetAdminPassword({
    targetUserId: parsed.data.userId,
    newPassword: parsed.data.password,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/settings");
  return { success: "Admin password has been reset." };
}

export async function removeAdminUserAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin?.id) return { error: "Unauthorized." };

  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) {
    return { error: "Invalid request." };
  }

  const result = await removeAdminUser({
    targetUserId: userId,
    actorUserId: admin.id,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/settings");
  return { success: "Admin access has been removed." };
}
