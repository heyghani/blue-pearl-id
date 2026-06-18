import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  sku: z.string().min(2, "SKU is required."),
  price: z.coerce.number().positive("Price must be greater than zero."),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
  categoryId: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Enter a valid image URL.").optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  isActive: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
});

export const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export const shippingRateSchema = z.object({
  price: z.coerce.number().min(0),
  estimatedDaysMin: z.coerce.number().int().min(1).optional().or(z.literal("")),
  estimatedDaysMax: z.coerce.number().int().min(1).optional().or(z.literal("")),
  isActive: z.coerce.boolean(),
});

export const refundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.coerce.number().positive("Refund amount must be greater than zero."),
  reason: z.string().max(500).optional(),
});
