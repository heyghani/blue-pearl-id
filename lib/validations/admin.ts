import { OrderStatus } from "@prisma/client";
import { z } from "zod";

import { uploadedImageUrlSchema } from "@/lib/validations/upload";

const optionalImageUrlSchema = z
  .union([z.string(), z.null()])
  .optional()
  .refine(
    (value) =>
      value == null ||
      value === "" ||
      uploadedImageUrlSchema.safeParse(value).success,
    "Upload a valid image.",
  );

const productOptionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
});

const productVariantSchema = z.object({
  sku: z.string().min(2),
  price: z.number().positive().nullable().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  quantity: z.number().int().min(0),
  // Generated variants use imageUrl: null until an image is uploaded.
  imageUrl: optionalImageUrlSchema,
  isActive: z.boolean().optional(),
  optionValues: z.record(z.string(), z.string()),
});

export function parseProductImageUrls(payload?: string | null) {
  if (!payload) return [];

  try {
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((url) => url.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export const productFormSchema = z
  .object({
    name: z.string().min(2, "Name is required."),
    slug: z
      .string()
      .min(2, "Slug is required.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
    sku: z.string().min(2, "SKU is required."),
    price: z.coerce.number().positive("Price must be greater than zero."),
    compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    tags: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    description: z.string().optional(),
    imagesPayload: z.string().optional(),
    quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    hasVariants: z.boolean(),
    variantsPayload: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const imageUrls = parseProductImageUrls(data.imagesPayload);

    for (const [index, url] of imageUrls.entries()) {
      if (!uploadedImageUrlSchema.safeParse(url).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["imagesPayload"],
          message: `Image ${index + 1} is not a valid uploaded image URL.`,
        });
      }
    }

    if (!data.hasVariants) return;

    let parsed: unknown = null;
    try {
      parsed = data.variantsPayload ? JSON.parse(data.variantsPayload) : null;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantsPayload"],
        message: "Variant data is invalid.",
      });
      return;
    }

    const payload = parsed as {
      options?: unknown;
      variants?: unknown;
    };

    const options = z.array(productOptionSchema).safeParse(payload.options ?? []);
    const variants = z.array(productVariantSchema).safeParse(payload.variants ?? []);

    if (!options.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantsPayload"],
        message:
          options.error.issues[0]?.message ??
          "Option data is invalid. Check option names and values.",
      });
    } else if (options.data.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantsPayload"],
        message: "Add at least one option with values (e.g. Color, Size).",
      });
    }

    if (!variants.success) {
      const issue = variants.error.issues[0];
      const field = issue?.path?.length ? issue.path.join(".") : "variant";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantsPayload"],
        message: `Invalid variant data (${field}): ${issue?.message ?? "check SKU, price, and images."}`,
      });
    } else if (variants.data.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variantsPayload"],
        message: "Generate at least one variant combination.",
      });
    }
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

export const createAdminUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required.").max(100),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  description: z.string().optional(),
  imageUrl: optionalImageUrlSchema,
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const brandFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  logoUrl: optionalImageUrlSchema,
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const resetAdminPasswordSchema = z
  .object({
    userId: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
