import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  parseVariantsPayload,
  type ProductOptionInput,
  type ProductVariantInput,
} from "@/lib/products/variants";

const variantInclude = {
  options: {
    orderBy: { position: "asc" as const },
    include: {
      values: { orderBy: { position: "asc" as const } },
    },
  },
  variants: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      optionValues: true,
    },
  },
} satisfies Prisma.ProductInclude;

export async function listAdminProducts({
  search,
  page = 1,
  limit = 20,
}: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.ProductWhereInput = { deletedAt: null };

  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { sku: { contains: search.trim(), mode: "insensitive" } },
      { slug: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
        inventory: true,
        variants: { where: { isActive: true }, select: { quantity: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getAdminProduct(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      inventory: true,
      ...variantInclude,
    },
  });
}

export type ProductInput = {
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId?: string | null;
  brandId?: string | null;
  tags?: string[];
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  quantity: number;
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
};

function resolveVariantPricing(variants: ProductVariantInput[], fallbackPrice: number) {
  const activePrices = variants
    .filter((variant) => variant.isActive)
    .map((variant) => variant.price ?? fallbackPrice)
    .filter((price) => Number.isFinite(price) && price > 0);

  if (activePrices.length === 0) {
    return { price: fallbackPrice, compareAtPrice: null as number | null };
  }

  const minPrice = Math.min(...activePrices);
  return { price: minPrice, compareAtPrice: null as number | null };
}

async function syncProductVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  hasVariants: boolean,
  options: ProductOptionInput[],
  variants: ProductVariantInput[],
  fallbackPrice: number,
) {
  await tx.productVariantValue.deleteMany({
    where: { variant: { productId } },
  });
  await tx.productVariant.deleteMany({ where: { productId } });
  await tx.productOptionValue.deleteMany({
    where: { option: { productId } },
  });
  await tx.productOption.deleteMany({ where: { productId } });

  if (!hasVariants || options.length === 0 || variants.length === 0) {
    await tx.product.update({
      where: { id: productId },
      data: { hasVariants: false },
    });
    return { price: fallbackPrice, quantity: 0 };
  }

  const optionValueMap = new Map<string, string>();

  for (const [optionIndex, option] of options.entries()) {
    const createdOption = await tx.productOption.create({
      data: {
        productId,
        name: option.name,
        position: optionIndex,
      },
    });

    for (const [valueIndex, value] of option.values.entries()) {
      const createdValue = await tx.productOptionValue.create({
        data: {
          optionId: createdOption.id,
          value,
          position: valueIndex,
        },
      });
      optionValueMap.set(`${option.name}::${value}`, createdValue.id);
    }
  }

  let totalQuantity = 0;

  for (const [index, variant] of variants.entries()) {
    const optionValueIds = Object.entries(variant.optionValues)
      .map(([optionName, value]) => optionValueMap.get(`${optionName}::${value}`))
      .filter((id): id is string => Boolean(id));

    if (optionValueIds.length !== options.length) {
      throw new Error(`Variant "${variant.sku}" has invalid option values.`);
    }

    const createdVariant = await tx.productVariant.create({
      data: {
        productId,
        sku: variant.sku,
        price: variant.price ?? null,
        compareAtPrice: variant.compareAtPrice ?? null,
        imageUrl: variant.imageUrl ?? null,
        quantity: variant.quantity,
        isActive: variant.isActive,
        sortOrder: index,
      },
    });

    await tx.productVariantValue.createMany({
      data: optionValueIds.map((optionValueId) => ({
        variantId: createdVariant.id,
        optionValueId,
      })),
    });

    if (variant.isActive) {
      totalQuantity += variant.quantity;
    }
  }

  const pricing = resolveVariantPricing(variants, fallbackPrice);

  await tx.product.update({
    where: { id: productId },
    data: {
      hasVariants: true,
      price: pricing.price,
      compareAtPrice: pricing.compareAtPrice,
    },
  });

  return { price: pricing.price, quantity: totalQuantity };
}

export async function createProduct(input: ProductInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        categoryId: input.categoryId || null,
        brandId: input.brandId || null,
        tags: input.tags ?? [],
        shortDescription: input.shortDescription ?? null,
        description: input.description ?? null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        hasVariants: input.hasVariants,
        images: input.imageUrl
          ? {
              create: {
                url: input.imageUrl,
                alt: input.name,
                isPrimary: true,
                sortOrder: 0,
              },
            }
          : undefined,
        inventory: {
          create: { quantity: input.hasVariants ? 0 : input.quantity },
        },
      },
    });

    if (input.hasVariants) {
      const synced = await syncProductVariants(
        tx,
        product.id,
        true,
        input.options,
        input.variants,
        input.price,
      );

      await tx.inventory.update({
        where: { productId: product.id },
        data: { quantity: synced.quantity },
      });
    }

    return product;
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        price: input.price,
        compareAtPrice: input.compareAtPrice ?? null,
        categoryId: input.categoryId || null,
        brandId: input.brandId || null,
        tags: input.tags ?? [],
        shortDescription: input.shortDescription ?? null,
        description: input.description ?? null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        hasVariants: input.hasVariants,
      },
    });

    let inventoryQuantity = input.quantity;

    if (input.hasVariants) {
      const synced = await syncProductVariants(
        tx,
        id,
        true,
        input.options,
        input.variants,
        input.price,
      );
      inventoryQuantity = synced.quantity;
    } else {
      await syncProductVariants(tx, id, false, [], [], input.price);
    }

    await tx.inventory.upsert({
      where: { productId: id },
      create: { productId: id, quantity: inventoryQuantity },
      update: { quantity: inventoryQuantity },
    });

    if (input.imageUrl) {
      const primary = await tx.productImage.findFirst({
        where: { productId: id, isPrimary: true },
      });

      if (primary) {
        await tx.productImage.update({
          where: { id: primary.id },
          data: { url: input.imageUrl, alt: input.name },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: id,
            url: input.imageUrl,
            alt: input.name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      }
    }

    return product;
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function setProductActive(id: string, isActive: boolean) {
  return prisma.product.update({
    where: { id, deletedAt: null },
    data: { isActive },
    select: { slug: true },
  });
}

export { parseVariantsPayload };
