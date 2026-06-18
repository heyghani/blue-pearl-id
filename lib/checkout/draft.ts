import { cookies } from "next/headers";

import type { AddressInput } from "@/lib/validations/checkout";
import { ShippingMethodType } from "@prisma/client";

export type CheckoutDraft = {
  email?: string;
  phone?: string;
  shippingAddress?: AddressInput;
  billingSameAsShipping?: boolean;
  billingAddress?: AddressInput;
  shippingMethod?: ShippingMethodType;
  couponCode?: string;
  notes?: string;
};

const CHECKOUT_DRAFT_COOKIE = "checkout_draft";
const MAX_AGE = 60 * 60 * 24; // 24 hours

export async function getCheckoutDraft(): Promise<CheckoutDraft> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CHECKOUT_DRAFT_COOKIE)?.value;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return {};
  }
}

export async function setCheckoutDraft(draft: CheckoutDraft) {
  const cookieStore = await cookies();
  const existing = await getCheckoutDraft();
  const merged = { ...existing, ...draft };

  cookieStore.set(CHECKOUT_DRAFT_COOKIE, JSON.stringify(merged), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearCheckoutDraft() {
  const cookieStore = await cookies();
  cookieStore.delete(CHECKOUT_DRAFT_COOKIE);
}
