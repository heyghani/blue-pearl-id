"use server";

import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearCheckoutDraft,
  getCheckoutDraft,
  setCheckoutDraft,
} from "@/lib/checkout/draft";
import { ENABLE_CREDIT_CARD_PAYMENT } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  calculateCheckoutTotals,
  createOrderFromCart,
} from "@/lib/services/order.service";
import { getCheckoutCart } from "@/lib/services/cart.service";
import {
  customerInfoSchema,
  paymentStepSchema,
  shippingStepSchema,
} from "@/lib/validations/checkout";

export type CheckoutActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function getAuthUser() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, phone: true },
  });
}

async function saveAbandonedCheckout(email: string, step: string) {
  const cart = await getCheckoutCart();
  if (!cart) return;

  const existing = await prisma.abandonedCheckout.findFirst({
    where: { email: email.toLowerCase(), orderId: null },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.abandonedCheckout.update({
      where: { id: existing.id },
      data: { cartSnapshot: cart.items, step },
    });
  } else {
    await prisma.abandonedCheckout.create({
      data: {
        email: email.toLowerCase(),
        cartSnapshot: cart.items,
        step,
      },
    });
  }
}

export async function saveCustomerInfoAction(
  _prev: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const parsed = customerInfoSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const cart = await getCheckoutCart();
  if (!cart) {
    return { error: "Your cart is empty." };
  }

  await setCheckoutDraft({
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || undefined,
  });

  await saveAbandonedCheckout(parsed.data.email, "customer");

  redirect("/checkout/shipping");
}

export async function saveShippingAction(
  _prev: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const draft = await getCheckoutDraft();
  if (!draft.email) {
    redirect("/checkout/information");
  }

  const billingSame = formData.get("billingSameAsShipping") === "on";

  const shippingAddress = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    phone: formData.get("phone") || draft.phone,
  };

  const parsed = shippingStepSchema.safeParse({
    shippingAddress,
    billingSameAsShipping: billingSame,
    billingAddress: billingSame ? undefined : shippingAddress,
    shippingMethod: formData.get("shippingMethod"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const cart = await getCheckoutCart();
  if (!cart) {
    return { error: "Your cart is empty." };
  }

  const totals = await calculateCheckoutTotals(
    cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    parsed.data.shippingMethod,
    draft.couponCode,
  );

  if ("error" in totals) {
    return { error: totals.error };
  }

  await setCheckoutDraft({
    shippingAddress: parsed.data.shippingAddress,
    billingSameAsShipping: parsed.data.billingSameAsShipping,
    billingAddress: parsed.data.billingSameAsShipping
      ? parsed.data.shippingAddress
      : parsed.data.billingAddress,
    shippingMethod: parsed.data.shippingMethod,
  });

  await saveAbandonedCheckout(draft.email, "shipping");

  redirect("/checkout/payment");
}

export async function placeOrderAction(
  _prev: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const draft = await getCheckoutDraft();
  if (!draft.email || !draft.shippingAddress || !draft.shippingMethod) {
    redirect("/checkout/information");
  }

  const parsed = paymentStepSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    couponCode: formData.get("couponCode"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (
    parsed.data.paymentMethod === "CREDIT_CARD" &&
    !ENABLE_CREDIT_CARD_PAYMENT
  ) {
    return { error: "Credit card payments are not available right now." };
  }

  const idempotencyKey = formData.get("idempotencyKey");
  if (typeof idempotencyKey !== "string" || !idempotencyKey) {
    return { error: "Missing idempotency key. Please refresh and try again." };
  }

  const cart = await getCheckoutCart();
  if (!cart) {
    return { error: "Your cart is empty." };
  }

  const user = await getAuthUser();
  const paymentMethod =
    parsed.data.paymentMethod === "CREDIT_CARD"
      ? PaymentMethod.CREDIT_CARD
      : PaymentMethod.PAYPAL;

  if (parsed.data.couponCode) {
    await setCheckoutDraft({ couponCode: parsed.data.couponCode });
  }

  const result = await createOrderFromCart({
    email: draft.email,
    phone: draft.phone,
    shippingAddress: draft.shippingAddress,
    billingAddress: draft.billingAddress ?? draft.shippingAddress,
    shippingMethod: draft.shippingMethod,
    paymentMethod,
    couponCode: parsed.data.couponCode || draft.couponCode,
    notes: parsed.data.notes,
    idempotencyKey,
    userId: user?.id,
    cartId: cart.id,
  });

  if (!result.success) {
    return { error: result.error };
  }

  await clearCheckoutDraft();
  revalidatePath("/", "layout");
  revalidatePath("/cart");

  redirect(`/checkout/processing?order=${result.orderNumber}`);
}

export async function getCheckoutPrefill() {
  const draft = await getCheckoutDraft();
  const user = await getAuthUser();

  return {
    draft,
    user,
  };
}
