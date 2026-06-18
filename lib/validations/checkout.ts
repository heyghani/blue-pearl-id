import { z } from "zod";
import { ShippingMethodType } from "@prisma/client";

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  line1: z.string().trim().min(1, "Address is required").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20),
  country: z
    .string()
    .trim()
    .length(2, "Select a country")
    .transform((v) => v.toUpperCase()),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const customerInfoSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const shippingStepSchema = z.object({
  shippingAddress: addressSchema,
  billingSameAsShipping: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  shippingMethod: z.nativeEnum(ShippingMethodType),
});

export const paymentStepSchema = z.object({
  paymentMethod: z.enum(["CREDIT_CARD", "PAYPAL"]),
  couponCode: z.string().trim().max(50).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const checkoutValidateSchema = customerInfoSchema
  .merge(
    z.object({
      shippingAddress: addressSchema,
      shippingMethod: z.nativeEnum(ShippingMethodType),
      couponCode: z.string().trim().optional(),
    }),
  )
  .partial({ couponCode: true });

export type AddressInput = z.infer<typeof addressSchema>;
export type CustomerInfoInput = z.infer<typeof customerInfoSchema>;
export type ShippingStepInput = z.infer<typeof shippingStepSchema>;
export type PaymentStepInput = z.infer<typeof paymentStepSchema>;
