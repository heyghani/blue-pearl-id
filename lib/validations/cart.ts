import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
});

export const addToCartPackSchema = z
  .object({
    productId: z.string().min(1),
    variantIds: z.array(z.string().min(1)).min(1).max(999),
  })
  .refine((data) => new Set(data.variantIds).size === data.variantIds.length, {
    message: "Each pair needs a different size.",
  });

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(999),
});
