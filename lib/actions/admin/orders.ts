"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/require-admin";
import { updateOrderStatus } from "@/lib/services/admin/order.service";
import { createRefund } from "@/lib/services/admin/refund.service";
import { orderStatusSchema, refundSchema } from "@/lib/validations/admin";

export type AdminActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

export async function updateOrderStatusAction(
  orderId: string,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = orderStatusSchema.safeParse({
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") || undefined,
    carrier: formData.get("carrier") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await updateOrderStatus({
    orderId,
    ...parsed.data,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: "Order status updated." };
}

export async function createRefundAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Unauthorized." };

  const parsed = refundSchema.safeParse({
    paymentId: formData.get("paymentId"),
    amount: formData.get("amount"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await createRefund({
    ...parsed.data,
    initiatedBy: admin.id!,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/orders");
  return { success: "Refund recorded. Complete the refund in your payment provider dashboard." };
}
