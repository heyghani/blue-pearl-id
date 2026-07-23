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
  imageUrls?: string[];
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

/** Interactive transactions time out at 5s by default; variant sync can exceed that on remote DBs. */
const PRODUCT_TX_OPTIONS = {
  maxWait: 10_000,
  timeout: 30_000,
} as const;

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
        values: {
          create: option.values.map((value, valueIndex) => ({
            value,
            position: valueIndex,
          })),
        },
      },
      include: { values: true },
    });

    for (const createdValue of createdOption.values) {
      optionValueMap.set(`${option.name}::${createdValue.value}`, createdValue.id);
    }
  }

  const variantOptionValueIds: string[][] = [];
  let totalQuantity = 0;

  for (const variant of variants) {
    const optionValueIds = Object.entries(variant.optionValues)
      .map(([optionName, value]) => optionValueMap.get(`${optionName}::${value}`))
      .filter((id): id is string => Boolean(id));

    if (optionValueIds.length !== options.length) {
      throw new Error(`Variant "${variant.sku}" has invalid option values.`);
    }

    variantOptionValueIds.push(optionValueIds);
    if (variant.isActive) {
      totalQuantity += variant.quantity;
    }
  }

  await tx.productVariant.createMany({
    data: variants.map((variant, index) => ({
      productId,
      sku: variant.sku,
      price: variant.price ?? null,
      compareAtPrice: variant.compareAtPrice ?? null,
      imageUrl: variant.imageUrl ?? null,
      quantity: variant.quantity,
      isActive: variant.isActive,
      sortOrder: index,
    })),
  });

  const createdVariants = await tx.productVariant.findMany({
    where: { productId },
    select: { id: true, sku: true },
  });
  const skuToId = new Map(createdVariants.map((row) => [row.sku, row.id]));

  const variantValueRows = variants.flatMap((variant, index) => {
    const variantId = skuToId.get(variant.sku);
    if (!variantId) {
      throw new Error(`Variant "${variant.sku}" was not created.`);
    }
    return variantOptionValueIds[index].map((optionValueId) => ({
      variantId,
      optionValueId,
    }));
  });

  if (variantValueRows.length > 0) {
    await tx.productVariantValue.createMany({ data: variantValueRows });
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

async function syncProductImages(
  tx: Prisma.TransactionClient,
  productId: string,
  imageUrls: string[],
  alt: string,
) {
  await tx.productImage.deleteMany({ where: { productId } });

  const urls = imageUrls.map((url) => url.trim()).filter(Boolean);

  if (urls.length === 0) {
    return;
  }

  await tx.productImage.createMany({
    data: urls.map((url, index) => ({
      productId,
      url,
      alt,
      isPrimary: index === 0,
      sortOrder: index,
    })),
  });
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
        images:
          input.imageUrls && input.imageUrls.length > 0
            ? {
                create: input.imageUrls.map((url, index) => ({
                  url,
                  alt: input.name,
                  isPrimary: index === 0,
                  sortOrder: index,
                })),
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
  }, PRODUCT_TX_OPTIONS);
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

    await syncProductImages(tx, id, input.imageUrls ?? [], input.name);

    return product;
  }, PRODUCT_TX_OPTIONS);
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
