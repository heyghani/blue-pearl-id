import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

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
        images: { where: { isPrimary: true }, take: 1 },
        inventory: true,
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
      images: { orderBy: { sortOrder: "asc" } },
      inventory: true,
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
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  quantity: number;
  isActive: boolean;
  isFeatured: boolean;
};

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
        shortDescription: input.shortDescription ?? null,
        description: input.description ?? null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
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
          create: { quantity: input.quantity },
        },
      },
    });

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
        shortDescription: input.shortDescription ?? null,
        description: input.description ?? null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
      },
    });

    await tx.inventory.upsert({
      where: { productId: id },
      create: { productId: id, quantity: input.quantity },
      update: { quantity: input.quantity },
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

export async function listAdminCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
